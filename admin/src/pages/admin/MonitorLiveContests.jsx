import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Users } from 'lucide-react';
import Table from '../../components/common/Table';
import { contestService } from '../../api/services/contestService';
import { getAdminSocket } from '../../api/services/adminSocketService';

const MonitorLiveContests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveContests = async () => {
    setLoading(true);
    try {
      const res = await contestService.getLiveContests();
      if (res?.success && Array.isArray(res.data)) {
        setContests(res.data);
      } else if (Array.isArray(res?.data)) {
        setContests(res.data);
      }
    } catch {
      // Backend may return 500 if live room table is empty or offline
      setContests((prev) => (prev.length > 0 ? prev : []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveContests();

    // Socket listener for real-time updates if connected
    const socket = getAdminSocket();
    if (socket && typeof socket.on === 'function') {
      const handleLiveUpdate = () => {
        fetchLiveContests();
      };
      socket.on('contest_participant_joined', handleLiveUpdate);
      socket.on('contest_updated', handleLiveUpdate);

      return () => {
        if (typeof socket.off === 'function') {
          socket.off('contest_participant_joined', handleLiveUpdate);
          socket.off('contest_updated', handleLiveUpdate);
        }
      };
    }
  }, []);

  // Update dynamic time remaining countdown ticker every second
  useEffect(() => {
    const timer = setInterval(() => {
      setContests((prev) =>
        prev.map((c) => {
          if (!c.endTime) return c;
          const end = new Date(c.endTime);
          const now = new Date();
          const diffSecs = Math.max(0, Math.floor((end - now) / 1000));
          if (diffSecs === 0) {
            return { ...c, timeRemaining: 'Ended' };
          }
          const mins = Math.floor(diffSecs / 60);
          const secs = diffSecs % 60;
          return {
            ...c,
            timeRemaining: `${mins} mins ${secs} secs`,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredContests = contests.filter((cnt) => {
    return cnt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cnt.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (cnt.id || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { key: 'id', label: 'Contest ID', cellClassName: 'font-mono text-[#E94B4B]' },
    { key: 'title', label: 'Contest Name', cellClassName: 'font-semibold' },
    { key: 'category', label: 'Category', cellClassName: 'text-gray-300' },
    { key: 'entryFee', label: 'Entry Fee', cellClassName: 'text-gray-400 font-medium' },
    { key: 'prizePool', label: 'Prize Pool', cellClassName: 'text-amber-500 font-bold' },
    {
      key: 'participants',
      label: 'Live Participants',
      render: (val) => (
        <div className="flex items-center gap-1.5 font-medium text-white">
          <Users size={14} className="text-[#E94B4B]" />
          <span>{val}</span>
        </div>
      )
    },
    { key: 'timeRemaining', label: 'Time Remaining', cellClassName: 'text-[#E94B4B] font-medium animate-pulse' },
    {
      key: 'status',
      label: 'Live Status',
      render: (val) => (
        <span className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
          <span className="capitalize">{val === 'live' ? 'Active' : val || 'Active'}</span>
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Monitor Live Contests</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time supervision of active contests, live scoreboards, and active rooms.</p>
        </div>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchLiveContests}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 active:translate-y-0.5 active:brightness-90"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredContests} loading={loading} />
      </div>
    </div>
  );
};

export default MonitorLiveContests;
