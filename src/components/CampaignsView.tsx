import React, { useState } from 'react';
import { 
  Plus, CheckCircle, AlertTriangle, Play, Pause, ChevronRight, 
  ArrowLeft, ArrowRight, Layers, Building2, MapPin, CheckCircle2, 
  Clock, XCircle, RefreshCw, Eye, MessageSquare, ShieldCheck, HelpCircle, FileText
} from 'lucide-react';
import { Campaign, BusinessProfile, Directory, CampaignDirectorySubmission } from '../types';

interface CampaignsViewProps {
  campaigns: Campaign[];
  businesses: BusinessProfile[];
  directories: Directory[];
  submissions: CampaignDirectorySubmission[];
  activeSubView: string; // "list", "new", or "campaign-c1"
  setActiveSubView: (view: string) => void;
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'submittedCount' | 'verifiedCount' | 'failedCount' | 'manualReviewCount'>, dirIds: string[]) => void;
  onUpdateSubmissionStatus: (submissionId: string, newStatus: CampaignDirectorySubmission['status'], updateCountsCallback?: () => void) => void;
  onAddSubmissionLog: (submissionId: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  theme: 'dark' | 'light';
}

export default function CampaignsView({
  campaigns,
  businesses,
  directories,
  submissions,
  activeSubView,
  setActiveSubView,
  onAddCampaign,
  onUpdateSubmissionStatus,
  onAddSubmissionLog,
  theme
}: CampaignsViewProps) {
  
  // Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [campName, setCampName] = useState('');
  const [selectedBProfileId, setSelectedBProfileId] = useState('');
  const [targetCountry, setTargetCountry] = useState('United States');
  const [targetCity, setTargetCity] = useState('');
  const [campCategory, setCampCategory] = useState('');
  const [campMode, setCampMode] = useState<Campaign['mode']>('Automation-ready');
  const [selectedDirectoryIds, setSelectedDirectoryIds] = useState<string[]>([]);
  const [retryFailed, setRetryFailed] = useState(true);
  const [detectDupes, setDetectDupes] = useState(true);

  // Active Simulating Loader Map for individual directory actions
  const [retrySimulatingIds, setRetrySimulatingIds] = useState<Record<string, boolean>>({});

  // Active focused directory inside detail logs
  const [focusedSubmissionId, setFocusedSubmissionId] = useState<string | null>(null);

  // Filter computations
  const currentCampaign = campaigns.find(c => `campaign-${c.id}` === activeSubView);
  const campaignSubmissions = currentCampaign 
    ? submissions.filter(s => s.campaignId === currentCampaign.id)
    : [];

  const handleNextWizard = () => {
    if (wizardStep === 1 && !selectedBProfileId) {
      alert('Please select a business profile before proceeding.');
      return;
    }
    if (wizardStep === 2) {
      if (!campName || !targetCity) {
        alert('Please fill out the Campaign Name and Target City.');
        return;
      }
    }
    if (wizardStep === 3 && selectedDirectoryIds.length === 0) {
      alert('Select at least one citation directory target.');
      return;
    }
    setWizardStep(wizardStep + 1);
  };

  const handlePrevWizard = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  const handleCreateCampaign = () => {
    const business = businesses.find(b => b.id === selectedBProfileId);
    onAddCampaign({
      workspaceId: 'w1',
      businessProfileId: selectedBProfileId,
      name: campName,
      targetCountry,
      targetCity,
      category: campCategory || business?.mainCategory || 'SEO Campaign',
      status: 'Running',
      mode: campMode,
      totalDirectories: selectedDirectoryIds.length
    }, selectedDirectoryIds);

    // Reset
    setActiveSubView('list');
    setWizardStep(1);
    setCampName('');
    setSelectedBProfileId('');
    setTargetCity('');
    setSelectedDirectoryIds([]);
  };

  const toggleDirectorySelection = (id: string) => {
    setSelectedDirectoryIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Highly Detailed Simulated Worker Submission Sequence logic
  const handleSimulatedWorkerRetry = (subId: string, directoryName: string) => {
    if (retrySimulatingIds[subId]) return;

    setRetrySimulatingIds(prev => ({ ...prev, [subId]: true }));
    onUpdateSubmissionStatus(subId, 'In Progress');

    // Feed step-by-step logs asynchronously to show realistic browser submission progress
    setTimeout(() => {
      onAddSubmissionLog(subId, `Launched Playwright headless engine on node container PORT:3000.`, 'info');
    }, 800);

    setTimeout(() => {
      onAddSubmissionLog(subId, `Opening login pathway to directory ${directoryName}. Searching pre-existing accounts...`, 'info');
    }, 1800);

    setTimeout(() => {
      onAddSubmissionLog(subId, `Mapping Business Schema. Fields matching consistent NAP profile verified.`, 'info');
    }, 3000);

    setTimeout(() => {
      onAddSubmissionLog(subId, `Form data inputs submitted successfully. Capturing directory callback screens.`, 'success');
      onUpdateSubmissionStatus(subId, 'Submitted');
    }, 4500);

    setTimeout(() => {
      onAddSubmissionLog(subId, `Index crawl checking confirm. Profile active URL detected inside search directory index.`, 'success');
      onUpdateSubmissionStatus(subId, 'Verified', () => {
        // Trigger React state propagation in App.tsx
      });
      setRetrySimulatingIds(prev => ({ ...prev, [subId]: false }));
    }, 6000);
  };

  // Styles Map
  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgClass = theme === 'dark' ? 'bg-[#121215]' : 'bg-white';
  const tableHeaderBg = theme === 'dark' ? 'bg-white/[0.01]' : 'bg-slate-50';

  return (
    <div className="space-y-6">
      
      {/* ----------------- SUB-VIEW: LIST CAMPAIGNS ----------------- */}
      {activeSubView === 'list' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">SEO Citation Campaigns</h1>
              <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                Launch form automation presets, track verifications, and monitor overall local workspace consistency metrics.
              </p>
            </div>
            <button
              onClick={() => setActiveSubView('new')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Start New Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((camp) => {
              const client = businesses.find(b => b.id === camp.businessProfileId);
              return (
                <div 
                  key={camp.id} 
                  className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-gray-500/20 ${cardBgClass} ${borderClass}`}
                  onClick={() => setActiveSubView(`campaign-${camp.id}`)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-400" />
                      <h3 className="font-display font-bold text-sm tracking-tight">{camp.name}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-gray-600" /> Client: <strong>{client?.businessName || 'General'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-600" /> target: {camp.targetCity}, {camp.targetCountry}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-bold uppercase">{camp.mode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-6 border-t md:border-t-0 border-gray-500/10 pt-4 md:pt-0">
                    {/* Progression bar block */}
                    <div className="text-left md:text-right space-y-1">
                      <span className="text-[11px] font-mono font-bold text-gray-300">
                        {camp.progress}% Completed
                      </span>
                      <div className="w-28 sm:w-36 h-2 bg-gray-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full" 
                          style={{ width: `${camp.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {camp.submittedCount} success / {camp.manualReviewCount} review needed
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider ${
                        camp.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/25' :
                        camp.status === 'Running' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/25 animate-pulse' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                      }`}>
                        {camp.status}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- SUB-VIEW: WIZARD LAUNCH CAMPAIGN ----------------- */}
      {activeSubView === 'new' && (
        <div className={`p-6 rounded-2xl border ${cardBgClass} ${borderClass}`}>
          
          {/* Header block back */}
          <button 
            onClick={() => setActiveSubView('list')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to campaigns
          </button>

          {/* Progress Indicator line */}
          <div className="flex items-center justify-between mb-8 max-w-lg mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border transition-all ${
                  wizardStep === s 
                    ? 'bg-sky-500 text-white border-sky-500 ring-4 ring-sky-500/20' 
                    : wizardStep > s 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white/5 border-white/[0.08] text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 5 && (
                  <div className={`h-[1px] flex-1 mx-2 ${
                    wizardStep > s ? 'bg-indigo-600' : 'bg-white/[0.08]'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 font-mono">CAMPAIGN CREATOR Step 0{wizardStep}</span>
            <h2 className="text-base font-bold font-display mt-0.5">
              {wizardStep === 1 && 'Select Target Client Business Profile'}
              {wizardStep === 2 && 'Location Scopes & Campaign Presets'}
              {wizardStep === 3 && 'Choose Target Directories Selection'}
              {wizardStep === 4 && 'Pre-Campaign Configuration Strategy'}
              {wizardStep === 5 && 'Verify Details & Trigger Launch'}
            </h2>
          </div>

          {/* Wizard step 1: Choose Businesses */}
          {wizardStep === 1 && (
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <label className="block text-xs font-semibold uppercase text-gray-400">Target Client Profile</label>
              
              {businesses.length === 0 ? (
                <div className="p-6 border border-dashed border-gray-500/20 text-center rounded-xl">
                  <p className="text-xs text-gray-500">No Business Profiles available. Please add a business first.</p>
                  <button 
                    onClick={() => setActiveSubView('list')} // Force back and trigger create
                    className="mt-3 text-xs bg-sky-500 text-white px-3 py-1.5 rounded-lg"
                  >
                    Go Back to Profiles
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {businesses.map((b) => (
                    <label 
                      key={b.id} 
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedBProfileId === b.id 
                          ? 'border-sky-500 bg-sky-500/5' 
                          : 'border-white/[0.06] hover:bg-white/5'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="biz" 
                        value={b.id} 
                        checked={selectedBProfileId === b.id}
                        onChange={() => setSelectedBProfileId(b.id)}
                        className="mt-1 border-gray-400/20 text-sky-500 focus:ring-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block">{b.businessName}</span>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">{b.address}, {b.city}, {b.state} • {b.phone}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wizard step 2: Campaign Information */}
          {wizardStep === 2 && (
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Campaign Name *</label>
                <input 
                  type="text" 
                  value={campName} 
                  onChange={(e) => setCampName(e.target.value)} 
                  placeholder="e.g. Seattle Location Campaign V1"
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none bg-[#18181b] border-white/[0.06] text-white`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Target City *</label>
                  <input 
                    type="text" 
                    value={targetCity} 
                    onChange={(e) => setTargetCity(e.target.value)} 
                    placeholder="e.g. Seattle"
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none bg-[#18181b] border-white/[0.06] text-white`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Target Country</label>
                  <select 
                    value={targetCountry} 
                    onChange={(e) => setTargetCountry(e.target.value)} 
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none bg-[#18181b] border-white/[0.06] text-white`}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Custom Niche SEO Category</label>
                <input 
                  type="text" 
                  value={campCategory} 
                  onChange={(e) => setCampCategory(e.target.value)} 
                  placeholder="e.g. Family Dentist (Optional)"
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none bg-[#18181b] border-white/[0.06] text-white`}
                />
              </div>
            </div>
          )}

          {/* Wizard step 3: Choose directories */}
          {wizardStep === 3 && (
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-gray-500/10 pb-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Available Directories Database ({directories.length})</span>
                <button 
                  onClick={() => setSelectedDirectoryIds(directories.map(d => d.id))}
                  className="text-[10px] text-sky-400 hover:underline cursor-pointer font-semibold"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                {directories.map((dir) => (
                  <label 
                    key={dir.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedDirectoryIds.includes(dir.id) 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : 'border-white/[0.04] hover:bg-white/5'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedDirectoryIds.includes(dir.id)}
                      onChange={() => toggleDirectorySelection(dir.id)}
                      className="mt-0.5 border-gray-400/20 text-sky-500 focus:ring-0 rounded w-3.5 h-3.5"
                    />
                    <div>
                      <span className="text-xs font-bold block">{dir.name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono font-semibold">DA {dir.authorityScore} • {dir.freeOrPaid}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Wizard step 4: Modes options settings */}
          {wizardStep === 4 && (
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <label className="block text-xs font-semibold uppercase text-gray-400">Workflow Execution Mode</label>
              
              <div className="space-y-3">
                {[
                  {
                    mode: 'Manual tracking',
                    title: 'Manual tracking only',
                    desc: 'Centralize details for your virtual assistant or specialist. Mark submissions manual once done.'
                  },
                  {
                    mode: 'Assisted workflow',
                    title: 'Assisted clipboard prefill workflow',
                    desc: 'Pre-format custom structures and coordinates. Speed up copying and clipboard inputs.'
                  },
                  {
                    mode: 'Automation-ready',
                    title: 'Automation-ready engine queue (Simulated MVP)',
                    desc: 'Prepares structures to feed Playwright headless browser worker triggers in sequential cycles.'
                  }
                ].map((preset) => (
                  <label 
                    key={preset.mode}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                      campMode === preset.mode 
                        ? 'border-sky-500 bg-sky-500/5' 
                        : 'border-white/[0.06] hover:bg-white/5'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="mode" 
                      value={preset.mode} 
                      checked={campMode === preset.mode}
                      onChange={() => setCampMode(preset.mode as Campaign['mode'])}
                      className="mt-1 border-gray-400/20 text-sky-500 focus:ring-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">{preset.title}</span>
                      <span className="text-[11px] text-gray-500 leading-normal block mt-0.5">{preset.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Wizard step 5: Summary detail review */}
          {wizardStep === 5 && (
            <div className="max-w-xl mx-auto space-y-4 text-left">
              <div className="p-4 rounded-xl border border-white/[0.06] bg-[#18181b] space-y-3">
                <h3 className="text-xs font-bold text-sky-400 uppercase font-mono tracking-widest">LAUNCH SPECIFICATIONS SUMMARY</h3>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <span className="text-gray-500 font-semibold">Campaign:</span>
                  <span className="col-span-2 font-medium">{campName || 'Untitled'}</span>

                  <span className="text-gray-500 font-semibold">Client:</span>
                  <span className="col-span-2 font-medium">
                    {businesses.find(b => b.id === selectedBProfileId)?.businessName}
                  </span>

                  <span className="text-gray-500 font-semibold">Target Location:</span>
                  <span className="col-span-2 font-medium">{targetCity}, {targetCountry}</span>

                  <span className="text-gray-500 font-semibold">Directories Selected:</span>
                  <span className="col-span-2 font-mono font-bold text-indigo-400">{selectedDirectoryIds.length} target sites</span>

                  <span className="text-gray-500 font-semibold">Active Mode:</span>
                  <span className="col-span-2 font-mono text-sky-400">{campMode}</span>
                </div>
              </div>

              {campMode === 'Automation-ready' && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/25 text-xs text-indigo-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Compliant Automation Safeguards:</strong> CitationPilot's automation-ready prefill prepares 
                    and validates payloads for remote headless browser worker nodes. Submission flows adhere to individual 
                    directory API structures strictly. Non-compliant tasks automatically fall back to the human manual review queue.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wizard navigator buttons footer */}
          <div className="mt-8 pt-4 border-t border-gray-500/10 flex items-center justify-between max-w-xl mx-auto">
            <button
              onClick={handlePrevWizard}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                wizardStep === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'border-white/[0.06] hover:bg-white/5 text-gray-400'
              }`}
              disabled={wizardStep === 1}
            >
              <span>Back</span>
            </button>

            {wizardStep < 5 ? (
              <button
                onClick={handleNextWizard}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleCreateCampaign}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Deploy Citation Run
              </button>
            )}
          </div>

        </div>
      )}

      {/* ----------------- SUB-VIEW: COMPILATION RADIAL DETAIL TRACKER ----------------- */}
      {currentCampaign && activeSubView.startsWith('campaign-') && (
        <div className="space-y-6">
          
          {/* Header row details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-500/10 pb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveSubView('list')}
                className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 font-mono">Campaign Detail Tracker</span>
                <h1 className="font-display font-extrabold text-lg leading-none mt-1">{currentCampaign.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                currentCampaign.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                'bg-sky-500/10 text-sky-400 border border-sky-500/25 animate-pulse'
              }`}>
                {currentCampaign.status}
              </span>
              
              <button
                onClick={() => alert('This report is ready inside the client Reports channel.')}
                className="text-xs py-2 px-3.5 rounded-xl border border-white/[0.06] hover:bg-white/5 text-gray-300 font-semibold cursor-pointer"
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* Quick Statistics details row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-left">
            {[
              { label: 'Total Targets', value: currentCampaign.totalDirectories, color: 'text-gray-300' },
              { label: 'Verified Citations', value: currentCampaign.verifiedCount, color: 'text-emerald-400' },
              { label: 'Submitted', value: currentCampaign.submittedCount, color: 'text-indigo-400' },
              { label: 'Review Queue', value: currentCampaign.manualReviewCount, color: 'text-amber-400' },
              { label: 'Failed Checkups', value: currentCampaign.failedCount, color: 'text-rose-400' },
              { label: 'Location Scope', value: currentCampaign.targetCity, color: 'text-sky-400' },
              { label: 'Campaign Mode', value: currentCampaign.mode, color: 'text-purple-400' },
              { label: 'Success Ratio', value: `${currentCampaign.progress}%`, color: 'text-emerald-400' }
            ].map((st, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${cardBgClass} ${borderClass}`}>
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">{st.label}</span>
                <div className={`text-base sm:text-lg font-black font-display tracking-tight mt-1 truncate ${st.color}`}>{st.value}</div>
              </div>
            ))}
          </div>

          {/* SUBMISSION ROW CONTROLS TABLE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Table Column listing (Left 2 Col) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className={`border rounded-2xl overflow-hidden ${cardBgClass} ${borderClass}`}>
                <div className="p-4 border-b border-gray-500/10 flex items-center justify-between bg-white/[0.01]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Directories submissions tracker table</h3>
                  <span className="text-[10px] text-gray-500">{campaignSubmissions.length} citation lanes active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase font-bold text-gray-500 ${tableHeaderBg}`}>
                        <th className="py-3 px-4">Directory</th>
                        <th className="py-3 px-4">Cost status</th>
                        <th className="py-3 px-4">Submission Status</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-500/10">
                      {campaignSubmissions.map((sub) => {
                        const dir = directories.find(d => d.id === sub.directoryId);
                        const isSimulating = retrySimulatingIds[sub.id];

                        return (
                          <tr 
                            key={sub.id} 
                            onClick={() => setFocusedSubmissionId(sub.id)}
                            className={`transition-colors cursor-pointer ${
                              focusedSubmissionId === sub.id ? 'bg-sky-500/10' : 'hover:bg-white/[0.01]'
                            }`}
                          >
                            {/* Directory Name */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold block text-gray-100 dark:text-white">{dir?.name}</span>
                              <span className="text-[10px] text-gray-500 truncate block mt-0.5">{dir?.domain}</span>
                            </td>

                            {/* Cost */}
                            <td className="py-3.5 px-4 font-semibold text-gray-400">{dir?.freeOrPaid}</td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                                sub.status === 'Verified' ? 'bg-green-500/15 text-green-500 border border-green-500/20' :
                                sub.status === 'Submitted' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' :
                                sub.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 animate-pulse' :
                                sub.status === 'Failed' ? 'bg-red-500/15 text-red-500 border border-red-500/20' :
                                'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                              }`}>
                                {sub.status}
                              </span>
                            </td>

                            {/* Direct fast interactive buttons */}
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                
                                {sub.status !== 'Verified' && (
                                  <button
                                    onClick={() => onUpdateSubmissionStatus(sub.id, 'Verified')}
                                    className="text-[10px] font-bold py-1 px-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-500 cursor-pointer"
                                    title="Mark listing as successfully verified live"
                                  >
                                    Verify Manually
                                  </button>
                                )}

                                {dir?.automationReady && sub.status !== 'Verified' && (
                                  <button
                                    onClick={() => handleSimulatedWorkerRetry(sub.id, dir.name)}
                                    className={`text-[10px] font-bold py-1 px-2 rounded-lg text-white cursor-pointer flex items-center gap-1 bg-sky-500 hover:bg-sky-600`}
                                    disabled={isSimulating}
                                  >
                                    {isSimulating ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                    <span>Retry Automated Prefill</span>
                                  </button>
                                )}

                                {sub.status !== 'Manual Review' && sub.status !== 'Verified' && (
                                  <button
                                    onClick={() => onUpdateSubmissionStatus(sub.id, 'Manual Review')}
                                    className="text-[10px] font-semibold py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 text-amber-500 border border-amber-500/20 cursor-pointer"
                                    title="Route task issues to Manual Review workspace"
                                  >
                                    Escalate Human
                                  </button>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

            {/* Focused timeline / Logs inspection stream (Right 1 Col) */}
            <div className="space-y-4">
              
              <div className={`p-5 rounded-2xl border ${cardBgClass} ${borderClass}`}>
                <div className="flex items-center justify-between mb-4 border-b border-gray-500/10 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Real-Time Worker Console Logs</span>
                  </h4>
                  <span className="w-2 h-2 rounded bg-sky-500 animate-pulse"></span>
                </div>

                {!focusedSubmissionId ? (
                  <div className="p-8 text-center text-xs text-gray-500 italic">
                    💡 Click on any directory row to inspect its dedicated browser automation console timelines.
                  </div>
                ) : (
                  (() => {
                    const focusedSub = submissions.find(s => s.id === focusedSubmissionId);
                    const isSimulating = retrySimulatingIds[focusedSubmissionId];
                    if (!focusedSub) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold block text-gray-400">Timeline for:</span>
                            <span className="text-xs font-black text-white">{directories.find(d => d.id === focusedSub.directoryId)?.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">Node v18.4</span>
                        </div>

                        {/* Scrolling code block simulation panel */}
                        <div className="p-3.5 rounded-xl bg-black font-mono text-[10px] text-gray-300 space-y-2 h-64 overflow-y-auto leading-relaxed text-left border border-white/[0.04]">
                          {focusedSub.logs.map((log, lIdx) => (
                            <div key={lIdx} className="flex gap-2.5 items-start">
                              <span className="text-gray-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                              <span className={`font-semibold shrink-0 uppercase tracking-wider text-[8px] px-1 rounded ${
                                log.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                log.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                log.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                'bg-sky-500/10 text-sky-400'
                              }`}>{log.type}</span>
                              <span className="text-gray-200">{log.message}</span>
                            </div>
                          ))}
                          
                          {isSimulating && (
                            <div className="flex gap-2 items-center text-sky-400 italic animate-pulse">
                              <span className="border-t-transparent border-t-2 border-sky-400 w-2.5 h-2.5 rounded-full animate-spin"></span>
                              <span>Playwright browser thread processing inputs...</span>
                            </div>
                          )}
                        </div>

                        {focusedSub.notes && (
                          <div className={`p-3 rounded-lg text-[11px] leading-normal ${
                            focusedSub.status === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                            focusedSub.status === 'Captcha Detected' || focusedSub.status === 'Manual Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                            'bg-gray-500/10 text-gray-400 border border-white/[0.04]'
                          }`}>
                            <strong>Special notes:</strong> {focusedSub.notes}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
