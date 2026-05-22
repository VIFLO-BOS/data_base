"use client";

import React, { useState } from "react";
import { Users, Search, Shield } from "lucide-react";

const mockUsers = [
  { id: '1', email: 'admin@annotator.com', firstName: 'Admin', lastName: 'User', status: 'active', roles: ['admin'], createdAt: 'Oct 1, 2023' },
  { id: '2', email: 'jane@client.com', firstName: 'Jane', lastName: 'Doe', status: 'active', roles: ['client'], createdAt: 'Oct 5, 2023' },
  { id: '3', email: 'john@tasker.com', firstName: 'John', lastName: 'Smith', status: 'active', roles: ['tasker'], createdAt: 'Oct 10, 2023' },
  { id: '4', email: 'bob@suspended.com', firstName: 'Bob', lastName: 'Wilson', status: 'suspended', roles: ['tasker'], createdAt: 'Sep 20, 2023' },
];

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-800',
  client: 'bg-emerald-100 text-emerald-800',
  tasker: 'bg-blue-100 text-blue-800',
  super_admin: 'bg-purple-100 text-purple-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-800',
  inactive: 'bg-stone-100 text-stone-600',
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  User Management
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Manage all platform users and roles
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="w-full flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.roles.map(role => (
                        <span key={role} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mr-1 ${roleBadgeColors[role] || 'bg-stone-100 text-stone-600'}`}>
                          <Shield className="w-3 h-3" /> {role}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[user.status] || 'bg-stone-100 text-stone-600'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
