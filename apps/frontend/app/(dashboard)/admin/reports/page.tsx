"use client";

import React, { useState } from "react";
import { FileBarChart, Download, Plus } from "lucide-react";

const mockReports = [
  { id: '1', name: 'Monthly Financial Summary', type: 'Finance', date: 'Oct 31, 2023', size: '2.4 MB' },
  { id: '2', name: 'Tasker Performance Q3', type: 'Performance', date: 'Oct 15, 2023', size: '1.1 MB' },
  { id: '3', name: 'Project Alpha Completion', type: 'Projects', date: 'Oct 12, 2023', size: '3.8 MB' },
];

export default function ReportsPage() {
  const [filterType, setFilterType] = useState('All');

  const filteredReports = filterType === 'All' 
    ? mockReports 
    : mockReports.filter(r => r.type === filterType);

  return (
    <div className="flex-1 flex flex-col justify-start items-start gap-4 lg:gap-6 w-full">
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-md border-0 flex flex-col justify-start items-start gap-6">
          {/* Header */}
          <div className="self-stretch pb-3 border-0 border-b shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileBarChart className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-stone-900 text-xl lg:text-2xl font-semibold leading-6 tracking-[-0.02em]">
                  Reports
                </div>
                <div className="text-zinc-400 text-xs font-medium mt-0.5">
                  Generate and download platform reports
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Generate Report
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full">
            {['All', 'Finance', 'Performance', 'Projects'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 border' 
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <div key={report.id} className="p-4 border border-stone-200 rounded-xl hover:shadow-md transition-shadow bg-white flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                    <FileBarChart className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-stone-100 text-stone-600 rounded">
                    {report.type}
                  </span>
                </div>
                <div>
                  <h3 className="text-stone-900 font-semibold text-sm leading-tight">{report.name}</h3>
                  <p className="text-stone-500 text-xs mt-1">Generated {report.date}</p>
                </div>
                <div className="pt-3 mt-1 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-xs text-stone-400 font-medium">{report.size}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
