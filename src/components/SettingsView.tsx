import React, { useState } from 'react';
import { 
  Settings, User, Lock, Database, Play, Eye, 
  HelpCircle, Shield, Sparkles, Check, Server, Terminal 
} from 'lucide-react';

interface SettingsViewProps {
  user: { name: string; email: string } | null;
  onUpdateUser: (name: string, email: string) => void;
  theme: 'dark' | 'light';
  onResetData?: () => void;
}

export default function SettingsView({ user, onUpdateUser, theme, onResetData }: SettingsViewProps) {
  const [userName, setUserName] = useState(user?.name || 'Demo Operator');
  const [userEmail, setUserEmail] = useState(user?.email || 'demo.operator@citationpilot.com');
  const [savedUserMsg, setSavedUserMsg] = useState(false);
  const [clickedReset, setClickedReset] = useState(false);

  // Playwright Worker Mock Configurations
  const [workerUrl, setWorkerUrl] = useState('https://playwright-agent-node.railway.internal');
  const [crawlDelay, setCrawlDelay] = useState(45);
  const [retryLim, setRetryLim] = useState(3);
  const [resolverType, setResolverType] = useState('human-guided');
  const [savedAutomationMsg, setSavedAutomationMsg] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(userName, userEmail);
    setSavedUserMsg(true);
    setTimeout(() => setSavedUserMsg(false), 3000);
  };

  const handleSaveAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAutomationMsg(true);
    setTimeout(() => setSavedAutomationMsg(false), 3000);
  };

  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgStyle = theme === 'dark' ? 'bg-[#0f0f12]' : 'bg-white';
  const labelClass = "block text-[10px] sm:text-xs font-semibold mb-1 text-gray-400 uppercase tracking-wider";
  const inputClass = `w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
    theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Workspace Settings</h1>
        <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Manage credentials, configure future Playwright submission nodes, and inspect Firebase cloud database status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (2 Col): Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: User Account details */}
          <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass}`}>
            <h3 className="font-display font-bold text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" /> Account Profile Settings
            </h3>
            
            {savedUserMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile credentials updated successfully.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Agency Full Name</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Registered Email Address</label>
                  <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Future Playwright worker parameters setup */}
          <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> Future Browser Automation Engine (Playwright)
              </h3>
              <span className="px-2 py-0.5 rounded text-[8px] tracking-wide uppercase font-black bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                AGENT CONFIG
              </span>
            </div>

            {savedAutomationMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Worker parameters saved to localStorage stack.
              </div>
            )}

            <form onSubmit={handleSaveAutomation} className="space-y-4">
              <div>
                <label className={labelClass}>Headless Browser Worker Endpoint Node URL</label>
                <div className="flex bg-[#18181b] rounded-xl overflow-hidden border border-white/[0.06] items-center px-3">
                  <span className="text-gray-600 text-xs select-none pr-1">https://</span>
                  <input 
                    type="text" 
                    value={workerUrl.replace('https://', '')} 
                    onChange={(e) => setWorkerUrl(e.target.value)} 
                    placeholder="my-playwright-worker.com/api" 
                    className="w-full text-xs py-2 bg-transparent focus:outline-none text-white font-mono" 
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">Specify the cloud service container (e.g. Railway, Cloud Run Container) carrying worker nodes.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Delay between directories submissions (Secs)</label>
                  <input 
                    type="number" 
                    value={crawlDelay} 
                    onChange={(e) => setCrawlDelay(parseInt(e.target.value) || 0)} 
                    className={inputClass} 
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Avoids anti-scraping blocks during submission rounds.</span>
                </div>

                <div>
                  <label className={labelClass}>Max Retry submissions threshold</label>
                  <select 
                    value={retryLim} 
                    onChange={(e) => setRetryLim(parseInt(e.target.value) || 3)}
                    className={inputClass}
                  >
                    <option value={1}>1 run cap</option>
                    <option value={3}>3 runs threshold (Default)</option>
                    <option value={5}>5 runs fallback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Bypass Captcha Solvers setup</label>
                <select 
                  value={resolverType} 
                  onChange={(e) => setResolverType(e.target.value)}
                  className={inputClass}
                >
                  <option value="human-guided">Human Guided Manual Review Queue (Most compliant)</option>
                  <option value="2captcha">2Captcha integration placeholder (API key required)</option>
                  <option value="not-solve">Fail thread immediately and escalate</option>
                </select>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md"
                >
                  Save Automation Workers Setup
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right 1 Column: Cloud Database Notices & compliance */}
        <div className="space-y-4">
          
          {/* Section 3: Firebase Dev notice Snippet */}
          <div className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-4`}>
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-xs">
              <Server className="w-4 h-4" />
              <span>Firebase Integration Blueprint</span>
            </div>

            <p className="text-[11px] leading-normal text-gray-400">
              CitationPilot's data layer supports persistent storage using Cloud Firestore. To connect your own project database, compile your workspace with the standard environment keys:
            </p>

            <div className="p-3.5 rounded-xl bg-black font-mono text-[9px] text-gray-400 space-y-1 block max-w-full overflow-x-auto text-left leading-normal border border-white/[0.04]">
              <div>VITE_FIREBASE_API_KEY="..."</div>
              <div>VITE_FIREBASE_AUTH_DOMAIN="..."</div>
              <div>VITE_FIREBASE_PROJECT_ID="..."</div>
              <div>VITE_FIREBASE_STORAGE_BUCKET="..."</div>
              <div>VITE_FIREBASE_SENDER_ID="..."</div>
              <div>VITE_FIREBASE_APP_ID="..."</div>
            </div>

            <p className="text-[10px] text-gray-500 italic leading-relaxed">
              * Note: The platform utilizes offline local storage cache fallbacks dynamically so it operates completely and cleanly without active servers.
            </p>
          </div>

          {/* Section 4: Compliance information */}
          <div className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-2 text-xs`}>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Ethical SEO Compliance bulletin</span>
            </div>
            
            <p className="text-gray-500 leading-normal text-[11.5px]">
              Users are responsible for adhering to directory-specific terms and services policies. 
              CitationPilot does not authorize spam submission behavior. Maintain human validation loops for accounts setups.
            </p>
          </div>

          {/* Section 5: Reset simulation database cache */}
          <div className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-3 text-xs`}>
            <div className="flex items-center gap-2 text-rose-500 font-semibold">
              <Database className="w-4 h-4 text-rose-500" />
              <span>Sandbox State Reset</span>
            </div>
            
            <p className="text-gray-500 leading-normal text-[11px]">
              Erase all client-side configurations, campaigns, custom businesses, and simulated logs to restore the pristine proof-of-work template dataset.
            </p>

            {clickedReset && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-green-400 rounded-lg text-[10px] font-bold">
                Simulation cache cleared and reloaded.
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (onResetData) {
                  onResetData();
                  setClickedReset(true);
                  setTimeout(() => setClickedReset(false), 3000);
                }
              }}
              className="w-full py-2.5 rounded-xl text-center font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
            >
              Reset Demo Data & Sync
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
