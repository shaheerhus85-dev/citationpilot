import React from 'react';
import { HelpCircle, MapPin, CheckCircle, BookOpen, AlertCircle, Info, PhoneCall } from 'lucide-react';

interface HelpViewProps {
  theme: 'dark' | 'light';
}

export default function HelpView({ theme }: HelpViewProps) {
  const manuals = [
    {
      title: "Why is local NAP consistency so important?",
      desc: "Google Business Profile uses automated geographic matching to determine business legitimacy. Even a minor discrepancy—like spelling out 'Suite' vs 'Ste' or changing the phone suffix—breaks indexing matching models, dropping search visibility rank significantly."
    },
    {
      title: "How do I clear physical mail requirements?",
      desc: "Main directories like Google and Bing places require coordinates confirmation through a postal mail envelope. Launch the directory profile via our links, order the physical postcard, then write down the 5-digit pin code. Input that code inside the task card inside our human-in-the-loop dashboard to mark it resolved!"
    },
    {
      title: "How do I deal with Captcha blocks?",
      desc: "Cloudflare, Arkose, or visual puzzles prevent standard automated scripts from spam registering directories. To solve these, the automation engine routes the task to the Manual Review queue, allowing you to open the registration lane, easily clear the puzzle in human browser contexts, and submit successfully."
    }
  ];

  const borderClass = theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBgStyle = theme === 'dark' ? 'bg-[#0f0f12]' : 'bg-white';

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Title */}
      <div className="border-b border-gray-500/10 pb-4">
        <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Guidance Manual & FAQs</h1>
        <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Review detailed local listings checklists, explore setup terms, and master automated campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core items (2/3 size) */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Comprehensive Local SEO Directory Q&A
            </h3>

            {manuals.map((m, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-2`}>
                <h4 className="font-bold text-xs text-gray-200 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{m.title}</span>
                </h4>
                <p className="text-xs text-gray-405 leading-relaxed text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Support cards */}
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-3 text-xs`}>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>Need help? Contact support</span>
            </div>
            
            <p className="text-gray-500 leading-relaxed text-[11px]">
              Have custom bulk directories checklist requirements or want to integrate custom Playwright workers endpoints? 
              Email our agency representative.
            </p>

            <div className="text-sky-400 font-bold block select-all font-mono text-[10px]">
              support@citationpilot.com
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${cardBgStyle} ${borderClass} space-y-2 text-xs`}>
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Ethical and Safe SEO policy</span>
            </div>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              We advise using valid client-owned email addresses and physical phone coordinates during registration rounds 
              to ensure permanent listing authority is preserved.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
