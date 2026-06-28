import React, { useState } from "react";
import { 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  User, 
  Trash2, 
  Search, 
  Clock, 
  Download, 
  Database,
  CheckCircle2,
  Filter
} from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityFeedProps {
  activities: ActivityLog[];
  onClearActivities: () => void;
  onLogManualActivity: (message: string) => void;
}

export default function ActivityFeed({ 
  activities, 
  onClearActivities,
  onLogManualActivity 
}: ActivityFeedProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMsg, setManualMsg] = useState("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMsg.trim()) return;
    onLogManualActivity(manualMsg);
    setManualMsg("");
  };

  const filteredActivities = activities.filter(act => {
    const matchesType = filterType === 'ALL' || act.type === filterType;
    const matchesSearch = act.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeStyles = (type: 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION') => {
    switch (type) {
      case 'AI_ASSISTANT':
        return {
          icon: <Sparkles className="w-4 h-4 text-cyan-500" />,
          bgColor: "bg-cyan-50 border-cyan-100/50",
          textColor: "text-cyan-800",
          pillBg: "bg-cyan-100/60 text-cyan-800 border-cyan-200"
        };
      case 'SYSTEM_ALERT':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
          bgColor: "bg-rose-50 border-rose-100/50",
          textColor: "text-rose-800",
          pillBg: "bg-rose-100 text-rose-800 border-rose-200"
        };
      case 'USER_ACTION':
        return {
          icon: <User className="w-4 h-4 text-amber-500 animate-pulse" />,
          bgColor: "bg-amber-50 border-amber-100/50",
          textColor: "text-amber-800",
          pillBg: "bg-amber-100 text-amber-800 border-amber-200"
        };
    }
  };

  const getReadableType = (type: string) => {
    return type.replace("_", " ");
  };

  const handleDownloadLogs = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(activities, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `lifesaver_activity_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      
      {/* Overview Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total Logged</span>
            <span className="text-xl font-black text-slate-900">{activities.length} Events</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">AI Actions</span>
            <span className="text-xl font-black text-cyan-600">
              {activities.filter(a => a.type === 'AI_ASSISTANT').length} Tasks
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">User Actions</span>
            <span className="text-xl font-black text-amber-600">
              {activities.filter(a => a.type === 'USER_ACTION').length} Logs
            </span>
          </div>
        </div>
      </div>

      {/* Main Filter & Feed Panel */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header with quick triggers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Unified Activity Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Continuous live telemetry recording system actions, schedule shifts, and manual checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleDownloadLogs}
              disabled={activities.length === 0}
              className="flex-grow md:flex-grow-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Download full database log as JSON"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={onClearActivities}
              disabled={activities.length === 0}
              className="flex-grow md:flex-grow-0 px-4 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear Logs
            </button>
          </div>
        </div>

        {/* Filter and Search Bar Row */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          {/* Pills filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-1.5 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </span>
            {[
              { id: 'ALL', label: 'All Activities' },
              { id: 'AI_ASSISTANT', label: '🤖 AI Assistant' },
              { id: 'USER_ACTION', label: '👤 User Check-ins' },
              { id: 'SYSTEM_ALERT', label: '⚠️ System Alerts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search form */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword logs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
            />
          </div>
        </div>

        {/* Append manual activity log block */}
        <form onSubmit={handleManualSubmit} className="flex gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
          <input
            type="text"
            value={manualMsg}
            onChange={(e) => setManualMsg(e.target.value)}
            placeholder="Record a custom activity log event (e.g., 'Finished draft phase 1 offline')..."
            className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shrink-0"
          >
            Log Activity
          </button>
        </form>

        {/* Timeline list */}
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center">
            <Activity className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-500">No activity logs found</p>
            <p className="text-[10px] text-slate-400 mt-1">Try adjusting your filters or typing a search query.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-5 sm:pl-8 space-y-6 py-2">
            {filteredActivities.map((act) => {
              const style = getTypeStyles(act.type);
              return (
                <div key={act.id} className="relative group">
                  
                  {/* Outer circle node */}
                  <span className={`absolute -left-[31px] sm:-left-[43px] top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border bg-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 z-10`}>
                    {style.icon}
                  </span>

                  {/* Log details card */}
                  <div className={`p-4 rounded-2xl border ${style.bgColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-shadow hover:shadow-xs`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.pillBg}`}>
                          {getReadableType(act.type)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{act.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-xs font-black text-slate-800 leading-relaxed pt-0.5">
                        {act.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase bg-white/65 px-2 py-1 rounded-lg border border-slate-100">
                        ✓ SECURE RECORD
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Safety Notice footer */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        Encrypted Ledger Sync Verified: Compliance level 100% active
      </div>

    </div>
  );
}
