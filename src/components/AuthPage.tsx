import React, { useState } from 'react';
import { Shield, Sparkles, ArrowLeft, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';

interface AuthPageProps {
  onLoginSuccess: (user: { name: string; email: string; isReal?: boolean; isVerified?: boolean; uid?: string }) => void;
  onGoBack: () => void;
  theme: 'dark' | 'light';
}

export default function AuthPage({ onLoginSuccess, onGoBack, theme }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const isFirebaseConfigured = !!auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setErrorMsg('Authentication requires Firebase configuration. Use Workbench Demo for preview.');
      return;
    }
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 5) {
      setErrorMsg('Password should be at least 5 characters long.');
      return;
    }
    setErrorMsg('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth!, email, password);
        const u = userCredential.user;
        onLoginSuccess({
          name: u.displayName || u.email?.split('@')[0] || 'SEO Expert',
          email: u.email || '',
          isReal: true,
          isVerified: u.emailVerified,
          uid: u.uid
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const u = userCredential.user;
        if (name) {
          await updateProfile(u, { displayName: name });
        }
        await sendEmailVerification(u);
        setVerificationSent(true);
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/password authentication is not enabled for this Firebase project. Use Workbench Demo for preview or enable Email/Password in Firebase Authentication.');
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      name: 'Shaheer Hussain Jafri',
      email: 'demo.operator@citationpilot.com',
      isReal: false,
      isVerified: true,
      uid: 'demo-uid-sandbox'
    });
  };

  if (verificationSent) {
    return (
      <div className={`min-h-screen font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#070707] text-[#F4F4F5]' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight leading-none mb-2">
            Verification Email Sent
          </h2>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'} leading-relaxed max-w-sm mx-auto mb-8`}>
            We have sent a verification link to <strong className="text-sky-400">{email}</strong>. Please check your inbox and verify your email to unlock your personal workspace.
          </p>
          <button
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#070707] text-[#F4F4F5]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Absolute Header link back home */}
      <div className="absolute top-6 left-6">
        <button 
          onClick={onGoBack}
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
            <span className="font-display tracking-tight text-xl">C</span>
          </div>
        </div>
        <h2 className="text-center font-display font-extrabold text-2xl tracking-tight leading-none">
          {isLogin ? 'Welcome back to CitationPilot' : 'Create your CitationPilot account'}
        </h2>
        <p className={`mt-2 text-center text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
        }`}>
          {isLogin ? 'Sign in to monitor physical business directory rankings.' : 'Get started with modern SEO automation support.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className={`border rounded-3xl p-8 shadow-xl ${
          theme === 'dark' ? 'bg-[#0f0f12] border-white/[0.06]' : 'bg-white border-slate-200'
        }`}>
          {!isFirebaseConfigured && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 text-center">
              Authentication requires Firebase configuration. Use Workbench Demo for preview.
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 text-center text-red-400">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-gray-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    disabled={!isFirebaseConfigured}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Demo Operator"
                    className={`w-full text-sm pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                      theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    } ${!isFirebaseConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-gray-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  disabled={!isFirebaseConfigured}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. demo.operator@example.com"
                  className={`w-full text-sm pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  } ${!isFirebaseConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  disabled={!isFirebaseConfigured}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full text-sm pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/[0.06] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  } ${!isFirebaseConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFirebaseConfigured}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 ${
                  !isFirebaseConfigured ? 'opacity-50 cursor-not-allowed hover:from-sky-500 hover:to-indigo-600' : 'cursor-pointer'
                }`}
              >
                {isLogin ? 'Sign In Securely' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Helper Note for Configuration & Signup requirements */}
          <div className="mt-4 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10 text-[11px] text-gray-500 dark:text-gray-400 text-center leading-normal">
            ⚙️ Private workspace signup requires Firebase Auth configuration. Demo mode works without signup.
          </div>

          {/* Primary Workbench Demo fallback CTA */}
          <div className="mt-5 border-t border-gray-500/15 pt-5">
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Launch Workbench Demo
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-sky-400 hover:underline select-none cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>
        </div>

        {/* Informative compliance footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500">
          <Shield className="w-3.5 h-3.5" />
          <span>Compliant local directory security protocols active.</span>
        </div>
      </div>
    </div>
  );
}
