import React, { useState } from 'react';
import { 
  Mail, Clock, CheckCircle, AlertCircle, Info, 
  ExternalLink, Search, RefreshCw, Layers, ShieldCheck, Check 
} from 'lucide-react';
import { CampaignDirectorySubmission, BusinessProfile, Directory } from '../types';

interface VerificationViewProps {
  submissions: CampaignDirectorySubmission[];
  businesses: BusinessProfile[];
  directories: Directory[];
  onUpdateSubmissionStatus: (submissionId: string, newStatus: CampaignDirectorySubmission['status']) => void;
  theme: 'dark' | 'light';
  user?: { name: string; email: string; isReal?: boolean; uid?: string } | null;
}

interface VerificationItem {
  id: string;
  submissionId: string;
  businessName: string;
  directoryName: string;
  targetEmail: string;
  senderName: string;
  verificationState: 'waiting' | 'found' | 'approval_required' | 'verified';
  subjectLine: string;
  receivedAt?: string;
  followUpUrl?: string;
}

export default function VerificationView({
  submissions,
  businesses,
  directories,
  onUpdateSubmissionStatus,
  theme,
  user
}: VerificationViewProps) {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<string>('All');
  const [pollerRunning, setPollerRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Local state for polling items to allow recruiter interaction & demonstratable updates
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>(() => {
    if (user?.isReal) return [];
    return [
      {
        id: 'v1',
        submissionId: 's5', // Hotfrog
        businessName: 'Demo Dental Campaign',
        directoryName: 'Hotfrog',
        targetEmail: 'contact@apex-dentistry-example.com',
        senderName: 'Hotfrog Support',
        verificationState: 'approval_required',
        subjectLine: 'Please verify your business profile: Demo Dental Campaign',
        receivedAt: '2026-06-11T12:05:00Z',
        followUpUrl: 'https://hotfrog.com/verify-listing/token-8372x912a'
      },
      {
        id: 'v2',
        submissionId: 's1', // Google Business
        businessName: 'Demo Dental Campaign',
        directoryName: 'Google Business Profile',
        targetEmail: 'contact@apex-dentistry-example.com',
        senderName: 'Google Business',
        verificationState: 'waiting',
        subjectLine: 'Your post mailer code is requested',
        receivedAt: undefined,
        followUpUrl: undefined
      },
      {
        id: 'v3',
        submissionId: 's3', // Yelp
        businessName: 'Demo Dental Campaign',
        directoryName: 'Yelp Listings',
        targetEmail: 'contact@apex-dentistry-example.com',
        senderName: 'Yelp Account Services',
        verificationState: 'waiting',
        subjectLine: 'Verify Yelp Owner Account',
        receivedAt: undefined,
        followUpUrl: undefined
      },
      {
        id: 'v4',
        submissionId: 's2', // Bing
        businessName: 'Demo Dental Campaign',
        directoryName: 'Bing Places',
        targetEmail: 'contact@apex-dentistry-example.com',
        senderName: 'Bing Places Admin',
        verificationState: 'verified',
        subjectLine: 'Your business listing is live in search!',
        receivedAt: '2026-06-02T14:31:00Z',
        followUpUrl: 'https://bing.com/places/claims/live-success'
      }
    ];
  });

  const handleRunSimulatorPoll = () => {
    setPollerRunning(true);
    setStatusMsg('Polling corporate inbox servers...');

    setTimeout(() => {
      // Transition from Waiting to Found or Approval Required
      setVerificationItems(prev => prev.map(item => {
        if (item.verificationState === 'waiting' && item.directoryName === 'Yelp Listings') {
          return {
            ...item,
            verificationState: 'found',
            receivedAt: new Date().toISOString(),
            subjectLine: 'Yelp Verification Match: Click inside profile link',
            followUpUrl: 'https://yelp.com/owner-confirm/auth-token-9302x'
          };
        }
        return item;
      }));
      setPollerRunning(false);
      setStatusMsg('IMAP scan complete. Discovered Yelp Verification Email!');
      setTimeout(() => setStatusMsg(''), 4000);
    }, 2000);
  };

  const handleVerifyItem = (vId: string, item: VerificationItem) => {
    // 1. Move state locally to verified
    setVerificationItems(prev => prev.map(v => v.id === vId ? { ...v, verificationState: 'verified', receivedAt: new Date().toISOString() } : v));
    // 2. Cascade update to main submissions state
    onUpdateSubmissionStatus(item.submissionId, 'Verified');
  };

  const filteredItems = verificationItems.filter(v => {
    const matchSearch = v.directoryName.toLowerCase().includes(search.toLowerCase()) || 
                        v.businessName.toLowerCase().includes(search.toLowerCase()) ||
                        v.subjectLine.toLowerCase().includes(search.toLowerCase());
    const matchType = filterState === 'All' || v.verificationState === filterState;
    return matchSearch && matchType;
  });

  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgStyle = theme === 'dark' ? 'bg-[#0f0f12]' : 'bg-white';

  return (
    <div className="space-y-6 text-left">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Email Verification Tracker</h1>
          <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            Track registration activation links and verification mails pulled automatically from matching proxy accounts.
          </p>
        </div>

        {/* Polling simulation trigger */}
        <button
          onClick={handleRunSimulatorPoll}
          disabled={pollerRunning}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-2 shadow-md transition-all border ${
            pollerRunning 
              ? 'bg-[#18181b] text-gray-400 border-white/[0.04]' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/10'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${pollerRunning ? 'animate-spin' : ''}`} />
          {pollerRunning ? 'Polling Mailbox...' : 'Run Simulation IMAP Poll'}
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* COMPLIANCE WARNING AND PLANS */}
      <div className={`p-5 rounded-2xl border text-xs leading-relaxed space-y-3 ${
        theme === 'dark' ? 'bg-[#121215] border-white/[0.06] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
          <span>Compliance Notice & Future IMAP Integration Roadmap</span>
        </div>
        <p>
          Our application design <strong>strictly guarantees user mailbox security and data privacy</strong>:
        </p>
        <ul className="list-disc pl-4 space-y-1 text-gray-400">
          <li><strong>Zero Plain-text Storage:</strong> The workbench plans to strictly avoid holding user plain-text Gmail credentials.</li>
          <li><strong>Planned GMail OAuth API Integration:</strong> The planned backend framework accesses specific message threads by integrating secure Google Developer Console OAuth scopes, looking exclusively for sender handles (e.g., <code>yelp.com</code>, <code>foursquare.com</code>).</li>
          <li><strong>Simulated States:</strong> The sandbox logs shown below represent how active background automation parses, updates, and completes directory submissions dynamically.</li>
        </ul>
      </div>

      {/* FILTER & SELECTOR GRID */}
      <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-3 ${
        theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
      }`}>
        <div className={`relative border rounded-xl overflow-hidden col-span-1 md:col-span-2 ${
          theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
        }`}>
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search by directory, target customer mail, or subject line..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-xs w-full focus:outline-none bg-transparent font-medium text-gray-300 dark:text-white"
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className={`text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
            theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <option value="All">Verification: All States</option>
          <option value="waiting">🔄 Waiting for Email</option>
          <option value="found">📩 Verification Email Found</option>
          <option value="approval_required">⚠️ Operator Approval Required</option>
          <option value="verified">✅ Verified Complete</option>
        </select>
      </div>

      {/* CORE CARDS GRID LIST */}
      {filteredItems.length === 0 ? (
        <div className={`p-8 rounded-2xl border border-dashed text-center py-12 ${
          theme === 'dark' ? 'bg-[#121215]/50 border-white/[0.1] text-gray-500' : 'bg-slate-50 border-slate-300 text-slate-500'
        }`}>
          <Mail className="w-8 h-8 mx-auto mb-3 text-indigo-400 opacity-60 animate-bounce" />
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">No Verification Mails Discovered</h3>
          <p className="text-[11px] max-w-md mx-auto leading-relaxed">
            Your verification queue is fully isolated. Start target SEO directory campaigns to pull active proxy mailbox activation streams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            return (
              <div key={item.id} className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${cardBgStyle} ${borderClass}`}>
                
                <div className="space-y-3 text-left">
                  {/* Header state */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-gray-500 tracking-wider">Target Listing Channel</span>
                      <h3 className="font-display font-extrabold text-sm text-gray-200 dark:text-white mt-0.5">{item.directoryName}</h3>
                    </div>

                    {/* Badges translation */}
                    <span className={`px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-black font-mono flex items-center gap-1 ${
                      item.verificationState === 'verified' ? 'bg-green-500/10 text-green-500' :
                      item.verificationState === 'approval_required' ? 'bg-amber-500/10 text-amber-500' :
                      item.verificationState === 'found' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.verificationState === 'verified' ? <Check className="w-3 h-3" /> : null}
                      {item.verificationState === 'verified' ? 'verified' :
                       item.verificationState === 'approval_required' ? 'approval required' :
                       item.verificationState === 'found' ? 'email found' :
                       'waiting for email'}
                    </span>
                  </div>

                  {/* Sender & subject lines info */}
                  <div className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
                    theme === 'dark' ? 'bg-black/20 border-white/[0.04]' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="font-bold">From:</span>
                      <span>{item.senderName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="font-bold">Subject:</span>
                      <span className="truncate italic">"{item.subjectLine || 'Empty thread'}"</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                      <span className="font-bold">To:</span>
                      <span>{item.targetEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Card footers */}
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-xs leading-none">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {item.receivedAt ? `Matched: ${new Date(item.receivedAt).toLocaleTimeString()}` : 'Awaiting IMAP match...'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.verificationState === 'approval_required' && item.followUpUrl && (
                      <button
                        onClick={() => {
                          const confirmUrl = confirm(`Follow directory validation route to verify listing manually?`);
                          if (confirmUrl) window.open(item.followUpUrl);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-[10px] font-bold cursor-pointer"
                      >
                        Follow Link
                      </button>
                    )}

                    {item.verificationState !== 'verified' && item.verificationState !== 'waiting' && (
                      <button
                        onClick={() => handleVerifyItem(item.id, item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 text-emerald-800 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Process Confirm Complete
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
