import React from 'react';
import { 
  Terminal, ShieldCheck, Cpu, Database, 
  HelpCircle, RefreshCw, Layers, Compass, 
  Eye, CheckCircle2, Zap, Server, Mail, ChevronRight 
} from 'lucide-react';

interface AboutViewProps {
  theme: 'dark' | 'light';
}

export default function AboutView({ theme }: AboutViewProps) {
  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgStyle = theme === 'dark' ? 'bg-[#0f0f12]' : 'bg-white';
  const codeBgStyle = theme === 'dark' ? 'bg-black/30 text-gray-400' : 'bg-slate-50 text-slate-700';

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      
      {/* Page Title & Correct Positioning Banner */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shrink-0 shadow-lg shadow-sky-500/10">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">System Architecture & Pipeline</h1>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-sky-400' : 'text-sky-700'} font-mono font-bold uppercase tracking-wider`}>
              CitationPilot Proof-of-Work MVP Technical Overview
            </p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-sky-950/20 border-sky-500/15 text-sky-200' : 'bg-sky-50 border-sky-100 text-sky-900'
        } leading-relaxed text-xs space-y-2.5`}>
          <p className="font-bold text-sm">🎯 Concept & Correct Positioning Brief</p>
          <p>
            <strong>CitationPilot</strong> is designed as a Local SEO Citation Automation Workbench. It is built for businesses, SEO operators, and automated marketing workflows to coordinate directory profiles cleanly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] font-semibold text-gray-400">
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>Professional SEO Operator Workbench Prototype</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-rose-500">✗</span>
              <span>NOT a Billing SaaS / Subscription Tool</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>Headless Worker Orchestration Hub</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-rose-500">✗</span>
              <span>NOT a fake fully autonomous scraper</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>Human-In-The-Loop Escalation Strategy</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-rose-500">✗</span>
              <span>NOT a black-hat CAPTCHA bypass engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: VISUAL PIPELINE FLOW CHART */}
      <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-5`}>
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" /> SEO Citation Core Pipeline Workflow
        </h3>
        
        <p className="text-xs text-gray-500 leading-relaxed">
          The diagram below structures how CitationPilot takes basic company business profile parameters and executes compliant geographic placements across local citation directories. Modulating from discovery to verification, security blockers automatically escalate to human operators.
        </p>

        {/* Visual blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
          
          {[
            { step: '1', title: 'NAP Profile', desc: 'Normalized address schema', icon: <Database className="w-4 h-4 text-emerald-400" /> },
            { step: '2', title: 'Discovery', desc: 'Niche/region targeting', icon: <Compass className="w-4 h-4 text-indigo-400" /> },
            { step: '3', title: 'Scoring', desc: 'DA rank & blocker check', icon: <Layers className="w-4 h-4 text-blue-400" /> },
            { step: '4', title: 'Submission', desc: 'Spawn state workers', icon: <Cpu className="w-4 h-4 text-sky-400" /> },
            { step: '5', title: 'Escalation', desc: 'Secure manual review', icon: <HelpCircle className="w-4 h-4 text-amber-400" /> },
            { step: '6', title: 'Email Check', desc: 'Follow-up IMAP links', icon: <Mail className="w-4 h-4 text-purple-400" /> },
            { step: '7', title: 'SEO Report', desc: 'Live indexable list', icon: <CheckCircle2 className="w-4 h-4 text-green-400" /> },
          ].map((node, idx) => (
            <div key={idx} className={`p-3 rounded-xl border relative text-center flex flex-col items-center justify-between ${
              theme === 'dark' ? 'bg-[#141418] border-white/[0.04]' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="text-[10px] font-mono text-gray-500 uppercase font-black absolute top-2 right-2 shrink-0">
                #{node.step}
              </div>
              <div className="p-2 rounded-lg bg-gray-500/10 mb-2 shrink-0">
                {node.icon}
              </div>
              <div className="text-[11px] font-bold text-gray-200 dark:text-white leading-tight">{node.title}</div>
              <div className="text-[9px] text-gray-500 mt-1 leading-tight">{node.desc}</div>
            </div>
          ))}
          
        </div>
      </div>

      {/* SECTION 2: FRONTEND PROTOTYPE VS FUTURE BACKEND Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Frontend mock setup */}
        <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-4`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-sm">Present Recruiter-Facing Prototype</h3>
          </div>
          
          <ul className="space-y-2 text-xs text-gray-400 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Dynamic State Persistence:</strong> Utilizes offline safe <code>localStorage</code> cache systems inside the sandbox to persist records, profile changes, and operations dynamically.
            </li>
            <li>
              <strong>Active Statistics Recalc:</strong> Computes real-time progress ratios, manual blocker tasks tallies, success percentages, and audit tables automatically.
            </li>
            <li>
              <strong>Cloud Firestore Readiness:</strong> All data adapters integrate seamless hooks connecting directly to Firebase Firestore databases once secret keys are loaded.
            </li>
            <li>
              <strong>Manual Review Solver:</strong> Operators can directly clear CAPTCHA or Login blockers inside the queue to simulate automated success and crawler progression.
            </li>
          </ul>
        </div>

        {/* Right Card: Full Backend Stack */}
        <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-4`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-sm">Future Full Production Backend Stack</h3>
          </div>
          
          <ul className="space-y-2 text-xs text-gray-400 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Node/Playwright Worker Cluster:</strong> Microservices executing headful/headless automated browser scripts. Playwright simulates typing, file uploads, and clicks on directory registration views.
            </li>
            <li>
              <strong>Directory Discovery Engine:</strong> Global domain aggregator that processes country mapping, keyword/niche authority scores, site indexing records, and cost details.
            </li>
            <li>
              <strong>IMAP Polling Service:</strong> Automated background workers polling active sub-accounts/proxy emails to retrieve confirmation messages. Scans body logs to instantly crawl verification links.
            </li>
            <li>
              <strong>Database Retry Broker:</strong> Task distribution systems like Redis/BullMQ managing rate-limiting, job priorities, custom directory timeouts, and backoff limits.
            </li>
          </ul>
        </div>

      </div>

      {/* SECTION 3: PLANNED DB SCHEMAS */}
      <div className={`p-6 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Planned SQL Database Relational Framework
          </h3>
          <span className="px-2 py-0.5 rounded text-[8px] tracking-wide uppercase font-black font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            PostgreSQL / Prisma
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          The planned PostgreSQL migration schemas structure citation queue states cleanly to support transactional integrity and multi-worker concurrent operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className={`p-4 rounded-xl font-mono text-[10px] space-y-2 leading-relaxed h-52 overflow-y-auto ${codeBgStyle}`}>
            <span className="text-sky-400 font-bold">// Campaign Directories Queue Schema</span>
            <pre>
{`Table CampaignSubmissions {
  id: uuid [pk]
  campaign_id: uuid [ref: > Campaigns.id]
  directory_id: uuid [ref: > Directories.id]
  status: enum [Ready, InProgress, Submitted, Verified, Failed]
  attempts_count: integer [default: 0]
  retry_after: timestamp
  submitted_profile_url: varchar
  logs: json_logs[]
  created_at: timestamp
  updated_at: timestamp
}`}
            </pre>
          </div>

          <div className={`p-4 rounded-xl font-mono text-[10px] space-y-2 leading-relaxed h-52 overflow-y-auto ${codeBgStyle}`}>
            <span className="text-purple-400 font-bold">// Email Verification Polling Table</span>
            <pre>
{`Table EmailVerificationPolls {
  id: uuid [pk]
  submission_id: uuid [ref: > CampaignSubmissions.id]
  proxy_email: varchar [index]
  target_sender: varchar
  poll_status: enum [Waiting, CodeFound, LinkClicked, Timeout]
  discovered_links: text[]
  password_access_claim: false // Security rule compliant
  imap_poll_frequency_sec: integer [default: 30]
}`}
            </pre>
          </div>

        </div>
      </div>

      {/* END COMPLIANCE BULLETIN */}
      <div className="text-center text-xs text-gray-500 font-medium">
        🛡️ Built in adherence to standard ethical SEO crawlers guidelines. <strong>No blackhat CAPTCHA bypass or fake claims implemented.</strong>
      </div>

    </div>
  );
}
