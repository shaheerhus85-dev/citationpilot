import React, { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, MapPin, Activity, FileText, 
  Settings, Layers, ShieldCheck, Sparkles, Database, 
  ListChecks, Globe, MessageSquare, Star, ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onGoToLogin: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function LandingPage({ onStartDemo, onGoToLogin, theme, setTheme }: LandingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const faqs = [
    {
      q: "What is a local business citation?",
      a: "A citation is any online mention of your local business's Name, Address, and Phone number (known as NAP). Search engines like Google trust businesses more when their NAP details are 100% consistent across multiple directories."
    },
    {
      q: "How does CitationPilot automate listing submissions?",
      a: "CitationPilot groups your directories into structured schema profiles. For manual directories, we generate assisted pre-filled workflows, while for automation-ready directories, future browser automation workers (Playwright agents) safely fill credentials and submit listing details natively, keeping the human operator in the loop."
    },
    {
      q: "Why is local NAP consistency so critical?",
      a: "Even a minor spelling error like 'Suite 100' vs 'St 100' or an outdated phone number can confuse search engine algorithms, eroding your ranking trust and turning away real customers."
    },
    {
      q: "Can I export custom reports for digital agency clients?",
      a: "Yes! Our agency plan features full CSV/Print reporting allowing you to hand over white-label proof of submission, direct URLs, and verification timelines to clients with one click."
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#070707] text-[#F4F4F5]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 select-none">
        <div className={`absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[120px] ${
          theme === 'dark' ? 'bg-gradient-to-tr from-sky-500/20 to-violet-500/10' : 'bg-gradient-to-tr from-sky-400/10 to-violet-400/5'
        }`}></div>
      </div>

      {/* Primary Header Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        theme === 'dark' ? 'border-white/[0.06] bg-[#070707]/75' : 'border-[#E2E8F0] bg-white/75'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/15">
              <span className="font-display tracking-tight text-lg">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight leading-none">CitationPilot</span>
              <span className="text-[10px] uppercase tracking-widest text-sky-500 font-semibold">SEO Automation</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#problems" className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}`}>The Problem</a>
            <a href="#solution" className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}`}>How It Works</a>
            <a href="#features" className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}`}>Workbench Features</a>
            <a href="#pricing" className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-slate-900'}`}>Developer Sandbox</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-[#242427] hover:bg-white/[0.04] text-gray-300' : 'border-[#E2E8F0] hover:bg-slate-100 text-slate-700'
              }`}
              title="Toggle visual style"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>

            <button 
              onClick={onGoToLogin}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/[0.04]' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sign In
            </button>

            <button 
              onClick={onStartDemo}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
            >
              Launch Pilot <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6 transition-all bg-sky-500/10 text-sky-500 border-sky-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Proof-of-work automation system</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none mb-6">
          Local citation campaigns,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
            managed from one intelligent dashboard
          </span>
        </h1>

        <p className={`text-base sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed font-normal ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
        }`}>
          CitationPilot helps agencies and SEO experts organize business NAP details, directory submissions,
          campaign progress, manual reviews, and client reporting. No more messy spreadsheets or forgotten passwords.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/20 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Launch Workbench Demo <ArrowRight className="w-5 h-5 animate-pulse" />
          </button>
          <button 
            onClick={onStartDemo}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'border-white/[0.08] hover:bg-white/[0.04] text-gray-200'
                : 'border-[#CBD5E1] hover:bg-slate-100 text-slate-700'
            }`}
          >
            Explore Dashboard Demo
          </button>
        </div>

        {/* Dashboard Preview Box */}
        <div className={`relative rounded-2xl border p-4 shadow-2xl transition-all ${
          theme === 'dark' ? 'bg-[#0f0f12]/90 border-white/[0.08]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between border-b border-gray-500/10 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="text-xs font-mono text-gray-500 ml-2">citationpilot.app/dashboard</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-500 border border-sky-500/20 font-bold uppercase">LIVE PREVIEW</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {[
              { label: 'Active Campaigns', value: '4 Campaigns', change: 'Running state', color: 'text-sky-500' },
              { label: 'Verified Citations', value: '327 Live Listings', change: '+29 this week', color: 'text-green-500' },
              { label: 'Manual Review Needed', value: '23 Pending Tasks', change: 'Require attention', color: 'text-amber-500' },
              { label: 'Avg SEO Success Rate', value: '78.4%', change: 'NAP score consistent', color: 'text-indigo-500' }
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                <div className={`text-xl font-bold font-display mt-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Graphical element inside preview */}
          <div className={`mt-4 rounded-xl p-4 text-left border ${
            theme === 'dark' ? 'bg-black/40 border-white/[0.04]' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                <h4 className="text-sm font-semibold font-display">Active Campaign: US West Strategy</h4>
              </div>
              <span className="text-xs text-gray-400 font-mono">62% Completion progress</span>
            </div>
            
            {/* Mock progress bar */}
            <div className="w-full h-2 bg-gray-500/20 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: '62%' }}></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-green-500 bg-green-500/5 p-1 px-2 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" /> Google Business (Postal Sent)
              </div>
              <div className="flex items-center gap-1.5 text-green-500 bg-green-500/5 p-1 px-2 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" /> Foursquare (Published)
              </div>
              <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 p-1 px-2 rounded">
                <Activity className="w-3.5 h-3.5 animate-spin" /> Yelp (Captcha Detected)
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400 bg-indigo-500/5 p-1 px-2 rounded">
                <Globe className="w-3.5 h-3.5" /> Bing Places (Synced Live)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problems" className={`py-20 border-t ${
        theme === 'dark' ? 'border-white/[0.06] bg-black/20' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl tracking-tight mb-4">
              Local SEO shouldn't involve fifty browser tabs
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>
              Manual citation building is repetitive, error-prone, and painful to track for agency clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "NAP Consistency Nightmares",
                desc: "Even tiny format variances ('Avenue' vs 'Ave') across directories weaken search position. Tracking spelling without centralized templates is nearly impossible."
              },
              {
                title: "Scattered Spreadsheets",
                desc: "Logging account passwords, check dates, emails, and publication statuses across dozens of spreadsheets creates confusion and delays client delivery."
              },
              {
                title: "The Manual Review Wall",
                desc: "Cloudflare checks, SMS PIN notifications, visual captchas, and telephone verifications break basic scripted scraping. You need structured human work queues."
              }
            ].map((p, i) => (
              <div key={i} className={`p-6 rounded-2xl border transition-all ${
                theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-4 font-bold">
                  0{i + 1}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{p.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section / How It Works */}
      <section id="solution" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-sky-500">The Workflow Solution</span>
          <h2 className="font-display font-extrabold text-3xl tracking-tight mt-2 mb-4">
            How CitationPilot Streamlines Submissions
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>
            Centralize your local SEO execution in 4 seamless, compliant steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "Step 1",
              title: "Define Business Profile",
              desc: "Add comprehensive client NAP details, descriptions, operating hours, categories, and active brand assets in a unified schema workspace."
            },
            {
              step: "Step 2",
              title: "Discover Directories",
              desc: "Search over 1,840 national and hyper-local citation targets filtered by Domain Authority, submission fee profiles, and geo-relevance."
            },
            {
              step: "Step 3",
              title: "Launch Citation Campaign",
              desc: "Deploy campaigns securely. Playwright-compatible states automatically pre-fill directory forms or route files to automated setups."
            },
            {
              step: "Step 4",
              title: "Solve Humans-in-the-Loop",
              desc: "Manage email triggers, custom phone confirmations, and captcha checkovers in a dedicated high-priority manual task queue."
            }
          ].map((s, i) => (
            <div key={i} className="relative">
              <span className="text-xs font-mono font-bold text-sky-500 block mb-1">{s.step}</span>
              <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{s.desc}</p>
              {i < 3 && <div className="hidden lg:block absolute top-1/4 right-0 w-8 h-[1px] bg-sky-500/20 translate-x-4"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-20 border-t ${
        theme === 'dark' ? 'border-white/[0.06] bg-black/40' : 'border-slate-100 bg-slate-100/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-500">Feature Rich</span>
            <h2 className="font-display font-extrabold text-3xl tracking-tight mt-2 mb-4">
              Everything an Agency Needs to Scale
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}>
              Power up your physical locations and local client directories without spreadsheet chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-5 h-5 text-sky-400" />,
                title: "Business Schema Engine",
                desc: "Complete NAP detail database enforcing consistent naming, phone formats, operating hours, and social connection fields to eliminate algorithmic penalization."
              },
              {
                icon: <ListChecks className="w-5 h-5 text-indigo-400" />,
                title: "Directory Opportunities Hub",
                desc: "Search, screen, and select targeted global directories (Yelp, GBP, Hotfrog, Bing, yellowpages) filtered by authority grades and entry obstacles."
              },
              {
                icon: <Activity className="w-5 h-5 text-violet-400" />,
                title: "Live Submission Tracker",
                desc: "Detailed timeline logs stream direct events inside every directory target. Easily inspect live URLs, submit attempts, and verification dates."
              },
              {
                icon: <Layers className="w-5 h-5 text-emerald-400" />,
                title: "Manual Review Queue",
                desc: "Elegant workspace to clear captcha blocks, confirm physical mail pin codes, handle visual errors, and upload custom registration verification logs."
              },
              {
                icon: <FileText className="w-5 h-5 text-amber-400" />,
                title: "White-Label Reports",
                desc: "Produce elegant, clean, client-ready summary exports showing successful citations, pending directory items, and overall local authority changes."
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-red-400" />,
                title: "Compliant Automation Design",
                desc: "Form pre-population frameworks with visual guidance systems designed strictly within directory terms to maintain safety and compliance."
              }
            ].map((f, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.04]' : 'bg-white border-slate-200'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  theme === 'dark' ? 'bg-white/[0.04]' : 'bg-slate-100'
                }`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Sandbox Section */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-sky-500 font-mono">Open Source & Sandbox Ready</span>
          <h2 className="font-display font-extrabold text-3xl tracking-tight mt-2 mb-4">
            Interactive Local SEO Workbench Sandbox
          </h2>
          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
            CitationPilot is a recruiter-facing developer showcase prototype designed to demonstrate the full citation automation workflow. There are no pricing plans, mock credit cards, or sub accounts locks. Explore the entire operator dashboard natively with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          <div className={`p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
          } flex flex-col justify-between h-full`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-lg">Instant Sandbox Simulation</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/25 font-bold uppercase">sandbox mode</span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'} leading-relaxed`}>
                Simulate form pre-population, validation rules, CAPTCHA escalation routing, manual resolve queues, verification link polling, and report generations in-memory inside the browser safely.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Interactive local businesses NAP creations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>CSV directory discovery uploading & parsing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Manual review queue simulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Detailed submission log streams</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onStartDemo}
              className="mt-8 w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Launch Core Sandbox Workbench <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className={`p-8 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
          } flex flex-col justify-between h-full`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-lg">Firebase Server Connection</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-bold uppercase">cloud mode</span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'} leading-relaxed`}>
                Interested in persistent state layers? CitationPilot has deep support for Firebase Cloud Firestore databases. Simply set up credentials in the workspace .env variables and the app switches immediately.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span>
                  <span>On-Snapshot database listener synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Auto database structural initialization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Persistent multi-workspace user profile states</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onGoToLogin}
              className={`mt-8 w-full py-3.5 px-4 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-white/[0.08] hover:bg-white/[0.04] text-gray-200' : 'border-[#CBD5E1] hover:bg-slate-50 text-slate-700'
              }`}
            >
              Developer Admin Sign In
            </button>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className={`py-20 border-t ${
        theme === 'dark' ? 'border-white/[0.06] bg-black/20' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
              Everything you need to know about compliant local SEO listings and platform mechanics.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.04]' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-display font-bold text-base mb-2 text-sky-400">{faq.q}</h3>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-16 text-center max-w-4xl mx-auto px-4">
        <h2 className="font-display font-extrabold text-3xl mb-4 leading-none">Ready to automate your local SEO?</h2>
        <p className={`text-sm max-w-xl mx-auto mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Join scaling local business agencies launching compliant, trackable citation directories in seconds.
        </p>
        <button 
          onClick={onStartDemo}
          className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-lg shadow-sky-500/25 cursor-pointer"
        >
          Open Workbench Demo
        </button>
        <div className="mt-12 text-[11px] text-gray-500 font-mono">
          © 2026 CitationPilot Project. Proof-of-work automation system designed for ethical search optimization.
        </div>
      </footer>
    </div>
  );
}
