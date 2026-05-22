'use client';

import React, { useState } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  date: string;
  status: 'Success' | 'Failed';
}

const mockLogs: AuditLog[] = [
  {
    id: 'AL-1001',
    user: 'Admin (System)',
    action: 'Created Project',
    resource: 'Project Alpha',
    date: 'Oct 24, 2023 14:32:01',
    status: 'Success',
  },
  {
    id: 'AL-1002',
    user: 'Jane Doe',
    action: 'Approved Timesheet',
    resource: 'TS-492',
    date: 'Oct 24, 2023 12:15:44',
    status: 'Success',
  },
  {
    id: 'AL-1003',
    user: 'System',
    action: 'Automated Payout',
    resource: 'Batch #239',
    date: 'Oct 24, 2023 00:00:01',
    status: 'Failed',
  },
  {
    id: 'AL-1004',
    user: 'Admin (System)',
    action: 'Deleted Tasker',
    resource: 'User ID #88',
    date: 'Oct 23, 2023 16:45:12',
    status: 'Success',
  },
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  Audit Logs
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Track system activities and user actions
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="w-full flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search logs by action or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <button className="h-10 px-4 bg-white border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Log ID</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-900">{log.id}</td>
                    <td className="px-4 py-3">{log.date}</td>
                    <td className="px-4 py-3">{log.user}</td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3">{log.resource}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
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
