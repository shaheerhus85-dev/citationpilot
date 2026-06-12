import React, { useState } from 'react';
import { 
  BarChart3, Database, Layers, CheckCircle2, FileText, 
  Settings, CreditCard, HelpCircle, LogOut, Sun, Moon, 
  Menu, X, Bell, Search, Globe, ChevronDown, Sparkles, Mail, Cpu, Compass
} from 'lucide-react';
import Logo, { LogoIcon } from './Logo';

interface AppShellProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
  user: { name: string; email: string; isReal?: boolean; uid?: string } | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  reviewCount: number;
}

export default function AppShell({ 
  children, 
  activeView, 
  onChangeView, 
  user, 
  onLogout, 
  theme, 
  setTheme,
  reviewCount
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return user?.isReal ? 'Private Secured Workspace' : 'CitationPilot Demo Workspace';
  });

  const workspaceOptions = user?.isReal 
    ? ['Private Secured Workspace', 'Production Workspace', 'Operator Sandbox'] 
    : ['CitationPilot Demo Workspace', 'Demo Workspace 2', 'Operator Sandbox'];

  const menuItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'businesses', label: 'Business Profiles', icon: <Globe className="w-4 h-4" /> },
    { id: 'directories', label: 'Global directory index', icon: <Database className="w-4 h-4" /> },
    { id: 'campaigns', label: 'SEO Campaigns', icon: <Layers className="w-4 h-4 text-sky-450" /> },
    { id: 'verification-tracker', label: 'Verification Tracker', icon: <Mail className="w-4 h-4" /> },
    { 
      id: 'manual-review', 
      label: 'Manual Review', 
      icon: <CheckCircle2 className="w-4 h-4" />, 
      badge: reviewCount > 0 ? reviewCount : undefined 
    },
    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-4 h-4" /> }
  ];

  const subItems = [
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'architecture', label: 'System Architecture', icon: <Cpu className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Docs', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const notifications = user?.isReal ? [] : [
    { id: 'n1', text: "Yelp automated submission simulation triggered.", time: "18 mins ago", unread: true },
    { id: 'n2', text: "Simulated verification postcard code required.", time: "2 hours ago", unread: true },
    { id: 'n3', text: "Demo Dental campaign progress reached 62%.", time: "1 day ago", unread: false }
  ];

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070707] text-[#F4F4F5]' : 'bg-[#F7F8FA] text-[#111827]'
    }`}>
      
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 border-r transition-colors z-20 ${
        theme === 'dark' ? 'bg-[#0c0c0e] border-white/[0.06]' : 'bg-white border-slate-200'
      }`}>
        
        {/* Brand logo bar */}
        <div className="p-4 h-16 flex items-center justify-between border-b border-gray-500/10">
          <Logo theme={theme} size="sm" showSubtitle={true} />
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-sky-500/10 text-sky-500 font-bold uppercase border border-sky-500/20 shrink-0">PROTOTYPE</span>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-gray-500/10 relative">
          <button 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className={`w-full py-2 px-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
              theme === 'dark' ? 'border-white/[0.04] bg-white/[0.02] text-gray-200 hover:bg-white/[0.04]' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-2.5 h-2.5 rounded bg-sky-500"></div>
              <span className="truncate">{activeWorkspace}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          </button>

          {showWorkspaceMenu && (
            <div className={`absolute top-full left-3 right-3 mt-1.5 rounded-xl border p-1 shadow-xl z-50 ${
              theme === 'dark' ? 'bg-[#121215] border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {workspaceOptions.map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left font-semibold text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeWorkspace === ws 
                      ? 'bg-sky-500 text-white font-bold' 
                      : (theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-slate-100 text-slate-600')
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeView === item.id || (item.id === 'campaigns' && activeView.startsWith('campaign-'));
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer group transition-colors duration-150 ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/20' 
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.02]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`transition-colors ${isActive ? 'text-sky-400' : 'text-gray-500 group-hover:text-gray-300'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded-full text-[9px] leading-tight animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-gray-500/5"></div>

          {subItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer transition-colors duration-150 ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/20' 
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.02]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-sky-400' : 'text-gray-500'}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-gray-500/10 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 select-none">
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold truncate leading-none">{user?.name || 'SEO Expert'}</span>
              <span className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email || 'user@citationpilot.com'}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              theme === 'dark' ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER DOCK */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b z-40 flex items-center justify-between px-4 transition-colors bg-white border-slate-200 dark:bg-[#0c0c0e] dark:border-white/[0.06]">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 -ml-2 rounded-lg cursor-pointer hover:bg-gray-500/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Logo theme={theme} size="sm" showSubtitle={false} />

        {/* Mobile quick icons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1 rounded cursor-pointer text-gray-500"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {user.name[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE COLLAPSED DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-l-0 top-16 bottom-0 left-0 w-64 border-r z-50 flex flex-col justify-between p-4 shadow-2xl transition-all duration-300 bg-white border-slate-200 dark:bg-[#0c0c0e] dark:border-white/[0.06]">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-2">MAIN NAV</div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer transition-colors ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/20' 
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.02]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded-full text-[9px] shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="my-4 border-t border-gray-500/5"></div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-2">UTILITIES</div>
            {subItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-pointer transition-colors ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border border-sky-500/20' 
                    : (theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.02]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <span className="text-gray-500">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-500/10">
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16">
        
        {/* HEADER BAR (Desktop) */}
        <header className={`hidden md:flex h-16 border-b transition-colors items-center justify-between px-8 shrink-0 z-10 ${
          theme === 'dark' ? 'bg-[#0a0a0c] border-white/[0.06]' : 'bg-white border-slate-200'
        }`}>
          
          {/* Breadcrumbs or active indication */}
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-mono tracking-widest uppercase py-1 px-2.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20`}>
              LOCAL SEO AUTOMATION FRAMEWORK
            </span>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400">
              <span>Status:</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold text-gray-300">Compliant Sandbox</span>
            </div>
          </div>

          {/* Action widgets */}
          <div className="flex items-center gap-4 relative">
            
            {/* Quick search */}
            <div className={`relative hidden lg:block border rounded-xl overflow-hidden ${
              theme === 'dark' ? 'border-white/[0.06] bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}>
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Find directory, client name..." 
                className="pl-8 pr-4 py-2 w-52 text-xs focus:outline-none focus:w-60 transition-all font-medium text-gray-400 bg-transparent"
                disabled
              />
            </div>

            {/* Notification alert bells */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl border relative cursor-pointer transition-colors ${
                  theme === 'dark' ? 'border-white/[0.05] hover:bg-white/[0.04] text-gray-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50 transition-all text-xs ${
                  theme === 'dark' ? 'bg-[#121215] border-white/[0.08] text-gray-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="font-semibold text-xs border-b border-gray-500/10 pb-2 mb-3 flex items-center justify-between">
                    <span>Campaign Alerts</span>
                    <span className="text-[10px] text-gray-400">3 Notifications</span>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex flex-col gap-0.5 border-b border-gray-500/5 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${n.unread ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>
                            {n.text}
                          </span>
                          {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 block shrink-0"></span>}
                        </div>
                        <span className="text-[10px] text-gray-500">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick manual theme switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-white/[0.05] hover:bg-white/[0.04] text-gray-300' : 'border-slate-200 hover:bg-[#F1F5F9] text-slate-700'
              }`}
              title="Toggle application look"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-sky-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* User status info */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{user?.name}</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-sky-500/15 text-sky-400 border border-sky-500/25">OPERATOR</span>
            </div>
          </div>
        </header>



        {/* CUSTOM SCROLL PANEL */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
