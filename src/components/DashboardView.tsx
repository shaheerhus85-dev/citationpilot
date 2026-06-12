import React from 'react';
import { 
  Compass, PlusCircle, CheckCircle2, AlertTriangle, 
  Clock, ArrowUpRight, BarChart3, ChevronRight, Activity, Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { BusinessProfile, Campaign, CampaignDirectorySubmission, Directory } from '../types';

interface DashboardViewProps {
  businesses: BusinessProfile[];
  campaigns: Campaign[];
  directories: Directory[];
  submissions: CampaignDirectorySubmission[];
  onChangeView: (view: string) => void;
  theme: 'dark' | 'light';
  user?: { name: string; email: string; isReal?: boolean; uid?: string } | null;
}

function AnimatedStatNumber({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  return (
    <motion.span
      key={String(value)}
      initial={{ scale: 0.82, opacity: 0.3, y: 3 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      className="inline-block"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function DashboardView({ 
  businesses, 
  campaigns, 
  directories,
  submissions, 
  onChangeView,
  theme,
  user
}: DashboardViewProps) {
  
  // Calculate stats based on memory lists dynamically
  const activeCampaigns = campaigns.filter(c => c.status === 'Running' || c.status === 'Queued');
  const finishedCampaigns = campaigns.filter(c => c.status === 'Completed');
  const failedCount = submissions.filter(s => s.status === 'Failed').length;
  const pendingCount = submissions.filter(s => s.status === 'Pending' || s.status === 'In Progress').length;
  const verifiedCount = submissions.filter(s => s.status === 'Verified').length;
  const submittedCount = submissions.filter(s => s.status === 'Submitted').length;
  const reviewCount = submissions.filter(
    s => s.status === 'Manual Review' || 
         s.status === 'Captcha Detected' || 
         s.status === 'Email Verification Needed'
  ).length;

  const totalVerifiedSaves = user?.isReal ? verifiedCount : 327 + verifiedCount; // Mock initial seeded for demo, clean 0 for real users

  // Computes premium dynamic success rate:
  // (verifiedCount + submittedCount) / submissions.length
  const successCount = verifiedCount + submittedCount;
  const totalSubCount = submissions.length || 1;
  const successRateNumeric = (user?.isReal && submissions.length === 0) ? "0" : Math.min(((successCount / totalSubCount) * 100), 100).toFixed(1);

  // Generate recent activity stream from campaign logging
  const recentLogs: { id: string; time: string; campaign: string; directory: string; msg: string; type: string }[] = user?.isReal ? [] : [
    { id: '1', time: '10 mins ago', campaign: 'Demo Dental Strategy', directory: 'Google Business Profile', msg: 'Verification postcard simulation requested', type: 'warning' },
    { id: '2', time: '40 mins ago', campaign: 'Demo Dental Strategy', directory: 'Yelp', msg: 'Cloudflare check routed to manual sandbox', type: 'review' },
    { id: '3', time: '2 hours ago', campaign: 'Demo Dental Strategy', directory: 'Foursquare', msg: 'Simulated listing verified alive', type: 'success' },
    { id: '4', time: '5 hours ago', campaign: 'Demo Local Business Strategy', directory: 'Bing Places', msg: 'Simulated directory sync complete', type: 'success' },
    { id: '5', time: '1 day ago', campaign: 'Demo Local Business Strategy', directory: 'Chamber of Commerce', msg: 'Simulated citation claim complete', type: 'info' }
  ];

  const cardStyle = theme === 'dark' 
    ? 'bg-[#121215] border-white/[0.06] hover:border-white/[0.1]' 
    : 'bg-white border-slate-200 hover:border-slate-300';

  return (
    <div className="space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Welcome back to CitationPilot</h1>
          
          {/* Status Indicators Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {user?.isReal ? (
              <>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                  Private Secured Workspace
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  Operator: {user?.name || user?.email?.split('@')[0]}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-sky-500/10 text-sky-400 border border-sky-500/15">
                  UID-Scoped Sandbox
                </span>
              </>
            ) : (
              <>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-sky-500/10 text-sky-400 border border-sky-500/15">
                  CitationPilot Demo Workspace
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  Operator: Shaheer Hussain Jafri
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/15">
                  Proof-of-work Sandbox (Demo/sample data only)
                </span>
              </>
            )}
          </div>

          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            Track SEO citation runs, monitor directory submissions, and manage manual review tasks from one organized workspace.
          </p>
        </div>

        {/* Quick action triggers */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onChangeView('businesses-new')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] cursor-pointer flex items-center gap-1.5 dark:text-gray-200"
          >
            <PlusCircle className="font-bold w-4 h-4 text-sky-400" /> Create Profile
          </button>
          
          <button
            onClick={() => onChangeView('campaigns-new')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-500/15 cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" /> Start New Campaign
          </button>
        </div>
      </div>

      {/* CORE PERFORMANCE METRIC CARDS WITH ANIMATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Active Campaigns */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Active Campaigns</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500"><Compass className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-gray-900 dark:text-white">
            <AnimatedStatNumber value={activeCampaigns.length} />
          </div>
          <div className="text-xs text-gray-400 mt-1 font-semibold">{campaigns.length} campaigns total</div>
        </div>

        {/* Card 2: Total Directories */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Total Directories</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-gray-900 dark:text-white">
            <AnimatedStatNumber value={1840 + (directories?.length || 10) - 10} />
          </div>
          <div className="text-xs text-green-500 mt-1 font-semibold">{(directories?.length || 10)} active sources</div>
        </div>

        {/* Card 3: Successful Citations */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Successful Citations</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-emerald-400">
            <AnimatedStatNumber value={totalVerifiedSaves} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Live active URLs synced</div>
        </div>

        {/* Card 4: Pending Submissions */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Pending Submissions</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-blue-400">
            <AnimatedStatNumber value={pendingCount + submittedCount} />
          </div>
          <div className="text-xs text-gray-400 mt-1">{submittedCount} pending crawl</div>
        </div>

        {/* Card 5: Failed/Needs Review */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Failed/Needs Review</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 animate-pulse"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-amber-400">
            <AnimatedStatNumber value={failedCount + reviewCount} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Human task actions</div>
        </div>

        {/* Card 6: Average Success Rate */}
        <div className={`p-4 rounded-2xl border transition-all ${cardStyle}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Average Success Rate</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold font-display mt-2 text-purple-400">
            <AnimatedStatNumber value={successRateNumeric} suffix="%" />
          </div>
          <div className="text-xs text-green-500 mt-1">
            {user?.isReal && submissions.length === 0 ? "Awaiting first run" : "Highly Consistent NAP"}
          </div>
        </div>
      </div>

      {/* CHARTS, DIRECTORY PROGRESSION, AND CAMPAIGNS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Active Citations Runs & Targets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Onboarding Empty State for Real Users */}
          {user?.isReal && campaigns.length === 0 && (
            <div className={`p-8 rounded-2xl border border-dashed text-center space-y-4 ${
              theme === 'dark' ? 'bg-[#121215]/50 border-white/[0.1]' : 'bg-slate-50/50 border-slate-300'
            }`}>
              <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Get Started with Your Verified Account</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal">
                  Your private UID workspace is fully initialized and isolated. Complete these steps to launch your first citation sequence:
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
                <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/[0.04]' : 'bg-white border-slate-200'}`}>
                  <div className="text-[10px] font-mono text-sky-400 font-bold uppercase mb-1">01. Profile</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">Create your first business profile</div>
                  <div className="text-[10px] text-gray-500 mt-1">Setup legal NAP: Name, Address, and Phone.</div>
                </div>
                <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/[0.04]' : 'bg-white border-slate-200'}`}>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase mb-1">02. Scope</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">Add target country and niche</div>
                  <div className="text-[10px] text-gray-500 mt-1">Target your customer base location precisely.</div>
                </div>
                <div className={`p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/[0.04]' : 'bg-white border-slate-200'}`}>
                  <div className="text-[10px] font-mono text-purple-400 font-bold uppercase mb-1">03. Workflow</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">Start your first citation workflow</div>
                  <div className="text-[10px] text-gray-500 mt-1">Let CitationPilot crawl, submit and verify links.</div>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => onChangeView('businesses-new')}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white cursor-pointer transition-colors shadow-sm"
                >
                  Create Business Profile Now
                </button>
              </div>
            </div>
          )}

          {/* Active Campaigns table summary */}
          <div className={`border rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h2 className="font-display font-medium text-sm">Active Citation Directories Strategy</h2>
              </div>
              <button 
                onClick={() => onChangeView('campaigns')}
                className="text-xs text-sky-400 hover:underline flex items-center"
              >
                View all runs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No active SEO directories launched. Click 'Start New Campaign' to begin!
              </div>
            ) : (
              <div className="divide-y divide-gray-500/10">
                {campaigns.map((camp) => {
                  const client = businesses.find(b => b.id === camp.businessProfileId);
                  return (
                    <div 
                      key={camp.id} 
                      onClick={() => onChangeView(`campaign-${camp.id}`)}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="min-w-0 pr-4">
                        <h3 className="text-xs font-bold truncate group-hover:text-sky-400 transition-colors">{camp.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Client: {client?.businessName || 'General'}</span>
                          <span>•</span>
                          <span>Region: {camp.targetCity}, {camp.targetCountry}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Progress Bar styled cleanly */}
                        <div className="text-right">
                          <span className="text-[11px] font-mono leading-none font-bold text-gray-300">
                            {camp.progress}% Done
                          </span>
                          <div className="w-24 h-1.5 bg-gray-500/20 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full" 
                              style={{ width: `${camp.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                          camp.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                          camp.status === 'Running' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse' :
                          camp.status === 'Queued' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {camp.status}
                        </span>
                        
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-sky-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Directory database health analysis */}
          <div className={`border rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
            <h3 className="font-display font-medium text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Core Directory Authorities</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(user?.isReal ? [
                { name: 'Google Business Profile', authority: 100, tag: 'Pending Run', stat: 'Awaiting launch' },
                { name: 'Yelp Listings', authority: 93, tag: 'Pending Run', stat: 'Awaiting launch' },
                { name: 'Bing Places', authority: 94, tag: 'Pending Run', stat: 'Awaiting launch' }
              ] : [
                { name: 'Google Business Profile', authority: 100, tag: 'Postcard Sent', stat: 'Awaiting PIN code' },
                { name: 'Yelp Listings', authority: 93, tag: 'Faced Captcha', stat: 'Human review queued' },
                { name: 'Bing Places', authority: 94, tag: 'Active Synced', stat: 'Listing verified live' }
              ]).map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold truncate pr-2">{item.name}</span>
                    <span className="text-[10px] font-mono text-indigo-400 font-extrabold shrink-0">DA {item.authority}</span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wide uppercase font-bold font-mono ${
                    item.tag === 'Active Synced' ? 'bg-green-500/10 text-green-500 border border-green-500/10' :
                    item.tag === 'Faced Captcha' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                    item.tag === 'Pending Run' ? 'bg-gray-500/10 text-gray-500 border border-gray-500/10' :
                    'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                  }`}>
                    {item.tag}
                  </span>
                  <div className="text-[11px] text-gray-500 mt-2">{item.stat}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Recent activity log streams */}
        <div className={`border rounded-2xl p-6 h-full ${theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Submission Worker Timeline</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-500/10">
            {recentLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Timeline is empty. Active background worker logs will stream here once campaigns run.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="relative pl-6 text-xs text-left">
                  {/* Node point */}
                  <div className={`absolute left-1 top-1.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    log.type === 'success' ? 'bg-green-500/20 border-green-500/30' :
                    log.type === 'warning' ? 'bg-amber-500/20 border-amber-500/30' :
                    log.type === 'review' ? 'bg-red-500/20 border-red-500/30' :
                    'bg-sky-500/20 border-sky-500/30'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      log.type === 'success' ? 'bg-green-400' :
                      log.type === 'warning' ? 'bg-amber-400' :
                      log.type === 'review' ? 'bg-red-400' :
                      'bg-sky-400'
                    }`}></div>
                  </div>

                  <div className="flex items-center justify-between gap-2.5">
                    <span className="font-semibold text-[11px] text-gray-400">{log.directory}</span>
                    <span className="text-[10px] text-gray-500 shrink-0 font-mono">{log.time}</span>
                  </div>
                  <div className="mt-0.5 text-gray-200 font-medium font-sans truncate pr-2 dark:text-gray-100">{log.msg}</div>
                  <span className="text-[10px] text-sky-500 font-mono">{log.campaign}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-gray-500/10 pt-4 text-center">
            <button
              onClick={() => onChangeView('manual-review')}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                theme === 'dark' ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              Solve Human Tasks Hub &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
