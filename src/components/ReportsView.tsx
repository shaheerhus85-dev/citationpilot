import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, FileText, Download, Copy, Check, 
  ExternalLink, ArrowUpRight, ShieldCheck, Printer, ArrowRight 
} from 'lucide-react';
import { Campaign, BusinessProfile, Directory, CampaignDirectorySubmission } from '../types';

interface ReportsViewProps {
  campaigns: Campaign[];
  businesses: BusinessProfile[];
  directories: Directory[];
  submissions: CampaignDirectorySubmission[];
  theme: 'dark' | 'light';
}

export default function ReportsView({
  campaigns,
  businesses,
  directories,
  submissions,
  theme
}: ReportsViewProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [copiedText, setCopiedText] = useState(false);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];
  const clientBProfile = activeCampaign ? businesses.find(b => b.id === activeCampaign.businessProfileId) : null;
  const campaignSubs = activeCampaign ? submissions.filter(s => s.campaignId === activeCampaign.id) : [];

  // Clipboard text copy generator helper
  const handleCopyClientSummary = () => {
    if (!activeCampaign || !clientBProfile) return;

    const summaryText = `
--------------------------------------------------
LOCAL CITATION DELIVERY REPORT | CITATIONPILOT
--------------------------------------------------
Campaign Name: ${activeCampaign.name}
Client Business: ${clientBProfile.businessName}
NAP Format: ${clientBProfile.businessName} | ${clientBProfile.phone} | ${clientBProfile.address}, ${clientBProfile.city}, ${clientBProfile.state} ${clientBProfile.postalCode}
Overall Completion: ${activeCampaign.progress}% Done

Submission Status Details:
- Total Targets: ${activeCampaign.totalDirectories}
- Verified Live Citations: ${activeCampaign.verifiedCount}
- Pending/Submitted: ${activeCampaign.submittedCount}
- Review Queue/Failed Actions: ${activeCampaign.manualReviewCount + activeCampaign.failedCount}

Active Directory Citation Links:
${campaignSubs.map(s => {
  const d = directories.find(x => x.id === s.directoryId);
  return `- ${d?.name}: [${s.status}] ${s.submittedUrl || 'Awaiting verify'}`;
}).join('\n')}

Generated at CitationPilot sandbox container portal. Dedicated Local SEO Citation Workbench Prototype.
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Dynamic CSV generator download utility
  const handleDownloadCSV = () => {
    if (!activeCampaign || !clientBProfile) return;

    // Header array
    const headers = ['Directory Name', 'Target Domain', 'Cost Status', 'Submission Status', 'Published Live URL', 'Attempts Tracked', 'Last Checked Date'];
    
    // Rows array
    const rows = campaignSubs.map(s => {
      const d = directories.find(x => x.id === s.directoryId);
      return [
        d?.name || 'Unknown',
        d?.domain || '',
        d?.freeOrPaid || 'Free',
        s.status,
        s.submittedUrl || 'Pending URL Verify',
        s.attempts.toString(),
        s.lastAttemptAt ? s.lastAttemptAt.split('T')[0] : 'N/A'
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CitationPilot_Report_${activeCampaign.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardStyle = theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200';

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-500/10 pb-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Client Executive Reports</h1>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            Export white-label CSV tables, copy text templates, and inspect clean print previews for local SEO clients.
          </p>
        </div>

        {/* Dropdown selector campaigns */}
        {campaigns.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Active Run:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none ${
                theme === 'dark' ? 'bg-[#121215] border-white/[0.06] text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeCampaign ? (
        <div className="p-8 text-center text-xs text-gray-500 italic">
          No campaign reports ready. Launch an active citation campaign first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Hub Left Column (1 Col) */}
          <div className="space-y-4">
            
            <div className={`p-5 rounded-2xl border ${cardStyle} space-y-4`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Report Exporter Panel</h3>
              <p className="text-xs leading-normal text-gray-500">
                Generate and forward report logs to client representatives. White-labeled tables can be converted with standard formats cleanly.
              </p>

              <div className="space-y-2 pt-2">
                
                <button
                  onClick={handleDownloadCSV}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-sky-500/10"
                >
                  <Download className="w-4 h-4" /> Download Compiled CSV File
                </button>

                <button
                  onClick={handleCopyClientSummary}
                  className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                    theme === 'dark' ? 'border-white/[0.06] hover:bg-white/5 text-gray-200' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" /> Clipboard Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Client Summary Text
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className={`w-full text-xs font-semibold py-2.5 px-3 rounded-xl border cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                    theme === 'dark' ? 'border-white/[0.06] hover:bg-white/5 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Printer className="w-4 h-4 text-indigo-400" /> Print Report Deck
                </button>

              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${cardStyle} text-xs space-y-3`}>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>SEO Indexing Checkups</span>
              </div>
              <p className="text-gray-500 leading-normal text-[11px]">
                Search engine bots crawl directories periodically. Once our database verifies a submission URL, 
                full local authority index synchronization typically occurs within 7 to 14 working days.
              </p>
            </div>

          </div>

          {/* White Paper Printing Frame (Right 2 Col) */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="p-4 border-b border-gray-500/10 flex justify-between items-center bg-transparent text-xs font-mono text-gray-500">
              <span>PREVIEW MODE: WHITE-LABEL PRINT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            {/* Structured client sheet wrapper */}
            <div className="bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-3xl mx-auto space-y-6 text-left selection:bg-sky-100 selection:text-sky-950">
              
              {/* Report Header Logo Row */}
              <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 font-mono">LOCAL CITATION RUN FEED</span>
                  <h2 className="text-xl font-extrabold font-display text-slate-900 mt-1">{activeCampaign.name}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Report generated automatically by CitationPilot SEO workflows.</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold font-display uppercase tracking-wider block text-slate-900">CitationPilot Workspace</span>
                  <span className="text-[10px] text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Client Business Profile card summary details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">NAP COORDINATES SPEC</span>
                  
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{clientBProfile?.businessName}</div>
                    <div className="text-slate-600">{clientBProfile?.address}, {clientBProfile?.city}, {clientBProfile?.state} {clientBProfile?.postalCode}</div>
                    <div className="font-mono font-bold text-slate-700">{clientBProfile?.phone}</div>
                    <div className="text-sky-600 font-semibold break-all">{clientBProfile?.website}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">RUN STATUS OVERVIEW</span>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span className="text-slate-500">Local Authority:</span>
                    <span className="font-bold text-slate-850 font-mono">{activeCampaign.progress}% Completion</span>

                    <span className="text-slate-500">Verified Citations:</span>
                    <span className="font-bold text-emerald-600 font-mono">{activeCampaign.verifiedCount} Listings</span>

                    <span className="text-slate-500">Submitted/Pending:</span>
                    <span className="font-bold text-sky-600 font-mono">{activeCampaign.submittedCount} Listings</span>
                  </div>
                </div>
              </div>

              {/* Detailed URL directory columns Table list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Citation Links Checklist</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wide font-bold">
                        <th className="py-2.5 px-3">Directory target</th>
                        <th className="py-2.5 px-3">Submission Status</th>
                        <th className="py-2.5 px-3">Published Citation URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {campaignSubs.map((sub) => {
                        const d = directories.find(x => x.id === sub.directoryId);
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{d?.name}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                                sub.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                sub.status === 'Submitted' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {sub.submittedUrl ? (
                                <a 
                                  href={sub.submittedUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sky-600 hover:underline flex items-center font-mono gap-0.5 break-all text-[10px]"
                                >
                                  {sub.submittedUrl} <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Pending live crawler confirmation</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* White footer */}
              <div className="border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400 font-mono">
                Report generated via secure local SEO compliance containers. Local SEO Citation Workbench Proof-of-Work Prototype.
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
