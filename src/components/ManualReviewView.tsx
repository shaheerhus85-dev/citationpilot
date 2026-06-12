import React, { useState } from 'react';
import { 
  CheckCircle2, AlertOctagon, HelpCircle, ArrowRight, Star, 
  MapPin, Clock, Check, Inbox, ExternalLink, RefreshCw 
} from 'lucide-react';
import { ManualReviewTask, BusinessProfile, Directory } from '../types';

interface ManualReviewViewProps {
  tasks: ManualReviewTask[];
  businesses: BusinessProfile[];
  directories: Directory[];
  onResolveTask: (taskId: string, notes?: string) => void;
  onSkipTask: (taskId: string) => void;
  theme: 'dark' | 'light';
}

export default function ManualReviewView({
  tasks,
  businesses,
  directories,
  onResolveTask,
  onSkipTask,
  theme
}: ManualReviewViewProps) {
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [filterType, setFilterType] = useState('All');

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Resolved' || t.status === 'Skipped');

  // Filter computation
  const filteredPending = pendingTasks.filter(t => {
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchType = filterType === 'All' || t.issueType === filterType;
    return matchPriority && matchType;
  });

  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgStyle = theme === 'dark' ? 'bg-[#0f0f12]' : 'bg-white';

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Human-in-the-Loop Hub</h1>
        <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Resolve tasks that custom crawlers cannot complete automatically. Clear CAPTCHAs, enter verification mails, or confirm paid directory logins.
        </p>
      </div>

      {/* FILTER BAR ROW */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-[#121215] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className={`text-xs px-3 py-2 rounded-xl border focus:outline-none ${
              theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-white border-slate-250 text-slate-800'
            }`}
          >
            <option value="All">Priority: All</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`text-xs px-3 py-2 rounded-xl border focus:outline-none ${
              theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-white border-slate-250 text-slate-800'
            }`}
          >
            <option value="All">Issue Style: All</option>
            <option value="Captcha">Arkose Captcha</option>
            <option value="Email verification">Email link confirmation</option>
            <option value="Needs human decision">Direct Decisions</option>
            <option value="Form error">Field Mismatch Error</option>
          </select>
        </div>

        <span className="text-xs text-gray-500 font-semibold">
          {filteredPending.length} human tasks pending resolution
        </span>
      </div>

      {/* CORE QUEUE COOLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Pending items cards list */}
        <div className="lg:col-span-2 space-y-4">
          
          {filteredPending.length === 0 ? (
            <div className={`border rounded-2xl p-12 text-center flex flex-col items-center justify-center ${borderClass}`}>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-extrabold text-sm text-gray-400">Queue is Clear! All systems normal.</h3>
              <p className="text-xs text-gray-600 max-w-sm mt-1">
                Submissions are either running successfully, or have loaded successfully into verified directory listings.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {filteredPending.map((task) => {
                const bProfile = businesses.find(b => b.id === task.businessProfileId);
                const dir = directories.find(d => d.id === task.directoryId);

                return (
                  <div 
                    key={task.id} 
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${cardBgStyle} ${borderClass} hover:border-gray-500/20`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-extrabold text-sm">{dir?.name} Listing Issue</h3>
                          <span className={`px-2 py-0.5 rounded text-[8px] tracking-wide uppercase font-black font-mono ${
                            task.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-semibold">
                          <span>Client: {bProfile?.businessName}</span>
                          <span>•</span>
                          <span>Category: {task.issueType}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const val = confirm(`Visit ${dir?.name} registration pathway to resolve manually?`);
                          if (val && dir?.domain) window.open(`https://${dir.domain}`);
                        }}
                        className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border flex items-center gap-1 ${
                          theme === 'dark' ? 'border-white/[0.08] hover:bg-white/5 text-gray-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                        title="Open external target domain to check listing manually"
                      >
                        Launch Domain <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Description Notes panel */}
                    <p className={`text-xs pl-3.5 border-l-2 border-amber-500 leading-relaxed font-sans ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                      {task.notes}
                    </p>

                    {/* NAP Helper values matching details */}
                    {bProfile && (
                      <div className={`p-3 rounded-xl text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono ${
                        theme === 'dark' ? 'bg-[#18181b]/50 border border-white/[0.04]' : 'bg-slate-50 border border-slate-150'
                      }`}>
                        <div>
                          <span className="text-gray-500 block">Organization Name:</span>
                          <span className="font-semibold text-gray-200 dark:text-white">{bProfile.businessName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Primary phone:</span>
                          <span className="font-semibold text-gray-200 dark:text-white">{bProfile.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Address Coordinates:</span>
                          <span className="font-semibold text-gray-200 dark:text-white truncate block">{bProfile.address}, {bProfile.city}</span>
                        </div>
                      </div>
                    )}

                    {/* Primary Button solutions */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => onSkipTask(task.id)}
                        className={`text-xs font-semibold py-1.5 px-3 rounded-xl border cursor-pointer ${
                          theme === 'dark' ? 'border-white/[0.06] hover:bg-white/5 text-gray-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Skip Task
                      </button>
                      <button
                        onClick={() => onResolveTask(task.id, 'Manually entering details completed.')}
                        className="text-xs font-bold py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Resolve Task Complete
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right 1 Column: Completed / Resolved Tasks History Logs */}
        <div className={`border rounded-2xl p-6 h-fit ${cardBgStyle} ${borderClass}`}>
          <h3 className="font-display font-bold text-sm mb-4">Historical Resolved Logs</h3>
          
          {completedTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 italic border border-dashed border-gray-500/10 rounded-xl">
              No tasks resolved in this browser session.
            </div>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((t) => {
                const dir = directories.find(d => d.id === t.directoryId);
                return (
                  <div key={t.id} className="p-3 border-b border-gray-500/5 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{dir?.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest font-black uppercase ${
                        t.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1 truncate">{t.notes}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                      Resolved: {t.resolvedAt ? new Date(t.resolvedAt).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
