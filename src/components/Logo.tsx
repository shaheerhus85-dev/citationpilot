import React from 'react';

interface LogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function LogoIcon({ className = 'w-8 h-8', theme = 'dark' }: { className?: string; theme?: 'dark' | 'light' }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="citationpilot-logo-icon-svg"
    >
      <defs>
        <linearGradient id="cp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <filter id="cp-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Compass Outer Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="32" 
        stroke="url(#cp-grad)" 
        strokeWidth="4" 
        className="opacity-95"
      />

      {/* Directional compass wedges */}
      {/* North */}
      <polygon points="50,11 46.5,17 53.5,17" fill="url(#cp-grad)" />
      {/* South */}
      <polygon points="50,89 46.5,83 53.5,83" fill="url(#cp-grad)" />
      {/* East */}
      <polygon points="89,50 83,46.5 83,53.5" fill="url(#cp-grad)" />
      {/* West */}
      <polygon points="11,50 17,46.5 17,53.5" fill="url(#cp-grad)" />

      {/* Location Pin Shape in Center */}
      <path 
        d="M50,27 C41.5,27 36,32.5 36,41 C36,52.5 50,67 50,67 C50,67 64,52.5 64,41 C64,32.5 58.5,27 50,27 Z" 
        fill="url(#cp-grad)" 
        filter="url(#cp-glow)"
      />
      
      {/* Pin Cutout hole */}
      <circle 
        cx="50" 
        cy="39.5" 
        r="4.5" 
        fill={theme === 'dark' ? '#09090b' : '#ffffff'} 
        className="transition-colors duration-200"
      />

      {/* Connected Automation/Route Line crossing lower area */}
      <path 
        d="M20,63 Q52,48 80,63" 
        fill="none" 
        stroke="url(#cp-grad)" 
        strokeWidth="3" 
        strokeLinecap="round"
      />

      {/* Connected node circles */}
      <circle 
        cx="34" 
        cy="56.5" 
        r="4.5" 
        fill="#38bdf8" 
        stroke={theme === 'dark' ? '#09090b' : '#ffffff'} 
        strokeWidth="1.5" 
        className="transition-colors duration-200"
      />
      <circle 
        cx="68" 
        cy="57.5" 
        r="4.5" 
        fill="#818cf8" 
        stroke={theme === 'dark' ? '#09090b' : '#ffffff'} 
        strokeWidth="1.5" 
        className="transition-colors duration-200"
      />
    </svg>
  );
}

export default function Logo({ 
  theme = 'dark', 
  size = 'md', 
  showSubtitle = true, 
  className = '' 
}: LogoProps) {
  const iconSizes = {
    sm: 'w-[32px] h-[32px] md:w-[35px] md:h-[35px]',
    md: 'w-[40px] h-[40px] md:w-[44px] md:h-[44px]',
    lg: 'w-[52px] h-[52px] md:w-[58px] md:h-[58px]'
  };

  const titleSizes = {
    sm: 'text-[15.5px] md:text-[16.5px]',
    md: 'text-[19px] md:text-[20.5px]',
    lg: 'text-[24px] md:text-[26.5px]'
  };

  const subtitleSizes = {
    sm: 'text-[7.5px] md:text-[8px] tracking-[0.24em]',
    md: 'text-[9px] md:text-[9.5px] tracking-[0.26em]',
    lg: 'text-[10.5px] md:text-[11px] tracking-[0.28em]'
  };

  const citationColors = {
    dark: 'text-white/95 font-semibold',
    light: 'text-slate-900 font-bold'
  };

  const pilotGradients = {
    dark: 'bg-gradient-to-r from-[#38bdf8] via-[#60a5fa] to-[#818cf8] font-extrabold',
    light: 'bg-gradient-to-r from-[#0284c7] via-[#2563eb] to-[#4f46e5] font-extrabold'
  };

  const subtitleColors = {
    dark: 'text-slate-400 font-medium',
    light: 'text-slate-500 font-semibold'
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`} id="citationpilot-brand-logo-lockup">
      {/* Left Icon mark */}
      <LogoIcon className={iconSizes[size]} theme={theme} />

      {/* Right Wordmark block */}
      <div className="flex flex-col justify-center select-none">
        <div className={`font-display flex items-baseline leading-none tracking-tight ${titleSizes[size]}`}>
          <span className={theme === 'dark' ? citationColors.dark : citationColors.light}>
            Citation
          </span>
          <span className="w-[4px]" /> {/* Elegant mechanical split space */}
          <span className={`bg-clip-text text-transparent ${theme === 'dark' ? pilotGradients.dark : pilotGradients.light}`}>
            Pilot
          </span>
        </div>
        {showSubtitle && (
          <div className={`font-mono uppercase mt-1 ${subtitleSizes[size]} ${theme === 'dark' ? subtitleColors.dark : subtitleColors.light} leading-none`}>
            SEO AUTOMATION
          </div>
        )}
      </div>
    </div>
  );
}

export function StandaloneAppIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <div 
      className={`${className} flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#18181b] to-[#09090b] shadow-lg border border-white/[0.08] relative overflow-hidden`}
      id="citationpilot-standalone-appicon"
    >
      {/* Ambient background blur gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-indigo-500/10 pointer-events-none" />
      <LogoIcon className="w-10 h-10" />
    </div>
  );
}
