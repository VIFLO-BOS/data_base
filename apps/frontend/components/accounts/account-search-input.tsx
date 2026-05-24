'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { getAccounts, Account } from '../../services/account-service';

interface AccountSearchInputProps {
  selectedAccounts: { id: string; name: string }[];
  onChange: (accounts: { id: string; name: string }[]) => void;
  placeholder?: string;
}

export function AccountSearchInput({
  selectedAccounts,
  onChange,
  placeholder = "Search and assign accounts...",
}: AccountSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch accounts when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const allAccounts = await getAccounts(1, 100);
        
        // Filter by name and exclude already selected
        const filtered = allAccounts.filter((a: Account) => {
          return a.name.toLowerCase().includes(query.toLowerCase()) && !selectedAccounts.some(sa => sa.id === a.id);
        });
        
        setResults(filtered);
        setIsOpen(true);
      } catch (e) {
        console.error('Failed to search accounts', e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceId = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceId);
  }, [query, selectedAccounts]);

  const handleSelect = (account: Account) => {
    if (!selectedAccounts.some(sa => sa.id === account.id)) {
      onChange([...selectedAccounts, { id: account.id, name: account.name }]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove: string) => {
    onChange(selectedAccounts.filter(a => a.id !== idToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      <label className="text-stone-700 text-sm font-medium">Assigned Account(s)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-zinc-300 bg-white text-sm text-stone-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-[68px] left-0 w-full bg-white border border-zinc-200 shadow-lg rounded-lg z-50 max-h-48 overflow-y-auto">
          {results.map(account => (
            <div
              key={account.id}
              onClick={() => handleSelect(account)}
              className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-sm text-stone-900 border-b border-zinc-100 last:border-0"
            >
              {account.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute top-[68px] left-0 w-full bg-white border border-zinc-200 shadow-lg rounded-lg z-50 p-3 text-sm text-zinc-500 text-center">
          No accounts found
        </div>
      )}

      {/* Selected Tags */}
      {selectedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedAccounts.map((account) => (
            <div
              key={account.id}
              className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 flex items-center gap-1.5 text-sm text-stone-700"
            >
              {account.name}
              <button
                type="button"
                onClick={() => handleRemove(account.id)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
