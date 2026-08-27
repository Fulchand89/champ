import React, { useState } from 'react';
import { Search, RotateCw, Download, FileText, BarChart2 } from 'lucide-react';
import Table from '../../components/common/Table';

const ViewReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const reports = [
    { id: 'REP001', name: 'Monthly Revenue Summary', range: '01 Jun 2026 - 30 Jun 2026', type: 'Financial', format: 'PDF, CSV' },
    { id: 'REP002', name: 'User Quiz Performance Analysis', range: 'Weekly Automated', type: 'Engagement', format: 'PDF' },
    { id: 'REP003', name: 'Contest Participation Statistics', range: '01 Jun 2026 - 30 Jun 2026', type: 'Contest Metrics', format: 'Excel' },
    { id: 'REP004', name: 'Coins Transaction Ledger', range: 'Last 90 Days', type: 'Financial', format: 'CSV' },
  ];

  const columns = [
    { key: 'id', label: 'Report ID', cellClassName: 'font-mono text-[#E94B4B]' },
    { key: 'name', label: 'Report Name', cellClassName: 'font-semibold' },
    { key: 'range', label: 'Data Range / Schedule', cellClassName: 'text-gray-300' },
    { key: 'type', label: 'Report Type', cellClassName: 'text-gray-400 text-sm' },
    { key: 'format', label: 'Available Formats', cellClassName: 'text-amber-500 font-mono text-sm' },
    {
      key: 'actions',
      label: 'Download',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: () => (
        <div className="flex items-center justify-center">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-semibold cursor-pointer transition-colors">
            <Download size={12} /> Download
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Reports & Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">Review operational, engagement, and financial reports from the platform.</p>
        </div>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer">
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={reports} />
      </div>
    </div>
  );
};

export default ViewReports;
