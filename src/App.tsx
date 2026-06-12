/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Workspace, BusinessProfile, Directory, Campaign, 
  CampaignDirectorySubmission, ManualReviewTask, SubmissionLog 
} from './types';
import { 
  INITIAL_BUSINESSES, INITIAL_DIRECTORIES, INITIAL_CAMPAIGNS, 
  INITIAL_SUBMISSIONS, INITIAL_MANUAL_REVIEW_TASKS 
} from './mockData';

// Component Imports
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AppShell from './components/AppShell';
import DashboardView from './components/DashboardView';
import BusinessesView from './components/BusinessesView';
import DirectoriesView from './components/DirectoriesView';
import CampaignsView from './components/CampaignsView';
import ManualReviewView from './components/ManualReviewView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import VerificationView from './components/VerificationView';
import HelpView from './components/HelpView';
import { Mail } from 'lucide-react';

// Firebase imports
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export default function App() {
  
  // Theme selection
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('cp_theme');
    return (saved === 'light') ? 'light' : 'dark';
  });

  // User credentials state
  const [user, setUser] = useState<{ name: string; email: string; isReal?: boolean; isVerified?: boolean; uid?: string } | null>(() => {
    const saved = localStorage.getItem('citationpilot:session');
    return saved ? JSON.parse(saved) : null;
  });

  // Sub view tracking state
  const [activeView, setActiveView] = useState<string>(() => {
    return user ? 'dashboard' : 'landing';
  });

  // Memory list states (lazily loaded/synchronized from the Correct namespace partition)
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [directories, setDirectories] = useState<Directory[]>(INITIAL_DIRECTORIES);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<CampaignDirectorySubmission[]>([]);
  const [manualTasks, setManualTasks] = useState<ManualReviewTask[]>([]);

  // Load namespace-scoped tables whenever the active user workspace changes
  useEffect(() => {
    if (!user) {
      setBusinesses([]);
      setCampaigns([]);
      setSubmissions([]);
      setManualTasks([]);
      return;
    }

    if (!user.isReal) {
      // 1. PUBLIC DEMO MODE
      const savedDemo = localStorage.getItem('citationpilot:demo:v1');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setBusinesses(parsed.businesses || INITIAL_BUSINESSES);
          setCampaigns(parsed.campaigns || INITIAL_CAMPAIGNS);
          setSubmissions(parsed.submissions || INITIAL_SUBMISSIONS);
          setManualTasks(parsed.manualTasks || INITIAL_MANUAL_REVIEW_TASKS);
        } catch (e) {
          console.warn("Loading demo cache failed: ", e);
          setBusinesses(INITIAL_BUSINESSES);
          setCampaigns(INITIAL_CAMPAIGNS);
          setSubmissions(INITIAL_SUBMISSIONS);
          setManualTasks(INITIAL_MANUAL_REVIEW_TASKS);
        }
      } else {
        setBusinesses(INITIAL_BUSINESSES);
        setCampaigns(INITIAL_CAMPAIGNS);
        setSubmissions(INITIAL_SUBMISSIONS);
        setManualTasks(INITIAL_MANUAL_REVIEW_TASKS);
        localStorage.setItem('citationpilot:demo:v1', JSON.stringify({
          businesses: INITIAL_BUSINESSES,
          campaigns: INITIAL_CAMPAIGNS,
          submissions: INITIAL_SUBMISSIONS,
          manualTasks: INITIAL_MANUAL_REVIEW_TASKS
        }));
      }
    } else {
      // 2. AUTHENTICATED PRIVATE SANDBOX WORKSPACE
      const userKey = `citationpilot:user:${user.uid}:v1`;
      const savedUser = localStorage.getItem(userKey);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setBusinesses(parsed.businesses || []);
          setCampaigns(parsed.campaigns || []);
          setSubmissions(parsed.submissions || []);
          setManualTasks(parsed.manualTasks || []);
        } catch (e) {
          console.warn("Loading private workspace failed: ", e);
          setBusinesses([]);
          setCampaigns([]);
          setSubmissions([]);
          setManualTasks([]);
        }
      } else {
        setBusinesses([]);
        setCampaigns([]);
        setSubmissions([]);
        setManualTasks([]);
        localStorage.setItem(userKey, JSON.stringify({
          businesses: [],
          campaigns: [],
          submissions: [],
          manualTasks: []
        }));
      }
    }
  }, [user]);

  // Synchronize dynamic table updates to the correct cache slot on mutations
  useEffect(() => {
    if (!user) return;

    if (!user.isReal) {
      localStorage.setItem('citationpilot:demo:v1', JSON.stringify({
        businesses,
        campaigns,
        submissions,
        manualTasks
      }));
    } else {
      const userKey = `citationpilot:user:${user.uid}:v1`;
      localStorage.setItem(userKey, JSON.stringify({
        businesses,
        campaigns,
        submissions,
        manualTasks
      }));
    }
  }, [user, businesses, campaigns, submissions, manualTasks]);

  // Apply Theme effects to Document Element for Tailwind
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('cp_theme', theme);
  }, [theme]);

  // Synchronize session store
  useEffect(() => {
    if (user) {
      localStorage.setItem('citationpilot:session', JSON.stringify(user));
    } else {
      localStorage.removeItem('citationpilot:session');
    }
  }, [user]);

  // Firestore Real-Time Query Snapshot listeners for real accounts
  useEffect(() => {
    if (!db || !user || !user.isReal || !user.uid) return;
    const currentUid = user.uid;

    // 1. Listen for Businesses owned by this UID
    const qBusinesses = query(collection(db, 'businesses'), where('workspaceId', '==', currentUid));
    const unsubBusinesses = onSnapshot(qBusinesses, (snapshot) => {
      const items: BusinessProfile[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as BusinessProfile);
      });
      setBusinesses(items);
    }, (error) => {
      console.warn("Businesses query snapshot feedback: ", error);
    });

    // 2. Listen for Campaigns matching this UID
    const qCampaigns = query(collection(db, 'campaigns'), where('workspaceId', '==', currentUid));
    const unsubCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      const items: Campaign[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Campaign);
      });
      setCampaigns(items);
    }, (error) => {
      console.warn("Campaigns query snapshot feedback: ", error);
    });

    // 3. Listen for Submissions matching this UID (Secure Workspace scoping)
    const qSubmissions = query(collection(db, 'submissions'), where('workspaceId', '==', currentUid));
    const unsubSubmissions = onSnapshot(qSubmissions, (snapshot) => {
      const items: CampaignDirectorySubmission[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as CampaignDirectorySubmission);
      });
      setSubmissions(items);
    }, (error) => {
      console.warn("Submissions synchronization error bypassed: ", error);
    });

    // 4. Listen for Manual tasks matching this UID (Secure Workspace scoping)
    const qTasks = query(collection(db, 'manualTasks'), where('workspaceId', '==', currentUid));
    const unsubManualTasks = onSnapshot(qTasks, (snapshot) => {
      const items: ManualReviewTask[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as ManualReviewTask);
      });
      setManualTasks(items);
    }, (error) => {
      console.warn("Manual Tasks queue feedback: ", error);
    });

    return () => {
      unsubBusinesses();
      unsubCampaigns();
      unsubSubmissions();
      unsubManualTasks();
    };
  }, [db, user]);

  const handleResetData = () => {
    if (!user) return;
    if (!user.isReal) {
      localStorage.setItem('citationpilot:demo:v1', JSON.stringify({
        businesses: INITIAL_BUSINESSES,
        campaigns: INITIAL_CAMPAIGNS,
        submissions: INITIAL_SUBMISSIONS,
        manualTasks: INITIAL_MANUAL_REVIEW_TASKS
      }));
      setBusinesses(INITIAL_BUSINESSES);
      setCampaigns(INITIAL_CAMPAIGNS);
      setSubmissions(INITIAL_SUBMISSIONS);
      setManualTasks(INITIAL_MANUAL_REVIEW_TASKS);
    } else {
      const userKey = `citationpilot:user:${user.uid}:v1`;
      localStorage.setItem(userKey, JSON.stringify({
        businesses: [],
        campaigns: [],
        submissions: [],
        manualTasks: []
      }));
      setBusinesses([]);
      setCampaigns([]);
      setSubmissions([]);
      setManualTasks([]);
    }
  };

  // Handle Authentication callbacks
  const handleLoginSuccess = (usr: { name: string; email: string; isReal?: boolean; isVerified?: boolean; uid?: string }) => {
    setUser(usr);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('landing');
  };

  const handleUpdateUser = (name: string, email: string) => {
    setUser(prev => prev ? { ...prev, name, email } : null);
  };

  // Add Business Profile
  const handleAddBusiness = async (profileData: Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'b-' + Math.random().toString(36).substring(2, 9);
    const currentUid = user?.uid || 'demo-uid-sandbox';
    const newProfile: BusinessProfile = {
      ...profileData,
      id: newId,
      workspaceId: currentUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (db) {
      try {
        await setDoc(doc(db, 'businesses', newId), newProfile);
      } catch (err) {
        console.warn("Firestore business write failed: ", err);
      }
    } else {
      setBusinesses(prev => [newProfile, ...prev]);
    }
  };

  // Delete Business Profile
  const handleDeleteBusiness = async (id: string) => {
    if (db) {
      try {
        await deleteDoc(doc(db, 'businesses', id));
      } catch (err) {
        console.warn("Firestore business delete failed: ", err);
      }
    } else {
      setBusinesses(prev => prev.filter(b => b.id !== id));
    }
  };

  // Deploy Campaign & Span Submissions
  const handleAddCampaign = async (
    campData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'submittedCount' | 'verifiedCount' | 'failedCount' | 'manualReviewCount'>,
    dirIds: string[]
  ) => {
    const campId = 'c-' + Math.random().toString(36).substring(2, 9);
    const currentUid = user?.uid || 'demo-uid-sandbox';
    
    // Create new campaign
    const newCampaign: Campaign = {
      ...campData,
      id: campId,
      workspaceId: currentUid,
      progress: 0,
      submittedCount: 0,
      verifiedCount: 0,
      failedCount: 0,
      manualReviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create submissions cards for each directory
    const newSubmissions: CampaignDirectorySubmission[] = dirIds.map(dId => {
      const subId = 's-' + Math.random().toString(36).substring(2, 9);
      const hostDir = directories.find(x => x.id === dId);

      return {
        id: subId,
        campaignId: campId,
        directoryId: dId,
        workspaceId: currentUid,
        status: 'Pending',
        attempts: 1,
        logs: [
          { timestamp: new Date().toISOString(), type: 'info', message: `Initialized campaign directory target for ${hostDir?.name || 'Local Store'}.` },
          { timestamp: new Date().toISOString(), type: 'info', message: `Queue prepared in ${campData.mode} strategy context.` }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    if (db) {
      try {
        await setDoc(doc(db, 'campaigns', campId), newCampaign);
        for (const s of newSubmissions) {
          await setDoc(doc(db, 'submissions', s.id), s);
        }
      } catch (err) {
        console.warn("Firestore campaign write failed: ", err);
      }
    } else {
      setCampaigns(prev => [newCampaign, ...prev]);
      setSubmissions(prev => [...newSubmissions, ...prev]);
    }
  };

  // Log pusher helper
  const handleAddSubmissionLog = async (submissionId: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const sObj = submissions.find(x => x.id === submissionId);
    if (!sObj) return;

    const newLog = { timestamp: new Date().toISOString(), type, message };
    const updatedLogs = [...sObj.logs, newLog];

    if (db) {
      try {
        await setDoc(doc(db, 'submissions', submissionId), {
          ...sObj,
          logs: updatedLogs,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore log write failed: ", err);
      }
    } else {
      setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId) {
          return {
            ...s,
            logs: updatedLogs
          };
        }
        return s;
      }));
    }
  };

  // Universal updater metrics for Campaigns count based on current submissions
  const recalculateCampaignStats = async (campId: string, currentSubs: CampaignDirectorySubmission[]) => {
    const campaignSubs = currentSubs.filter(s => s.campaignId === campId);
    
    const total = campaignSubs.length;
    if (total === 0) return;

    const verified = campaignSubs.filter(s => s.status === 'Verified').length;
    const submitted = campaignSubs.filter(s => s.status === 'Submitted').length;
    const failed = campaignSubs.filter(s => s.status === 'Failed').length;
    const manuals = campaignSubs.filter(
      s => s.status === 'Manual Review' || 
           s.status === 'Captcha Detected' || 
           s.status === 'Email Verification Needed'
    ).length;

    // Progression ratio: (Verified + Submitted * 0.5) / Total percentage representation
    const progressPerc = Math.round(((verified + (submitted * 0.5)) / total) * 100);

    const matchCamp = campaigns.find(c => c.id === campId);
    if (matchCamp) {
      const updatedCampaign: Campaign = {
        ...matchCamp,
        verifiedCount: verified,
        submittedCount: submitted,
        failedCount: failed,
        manualReviewCount: manuals,
        progress: Math.min(progressPerc, 100),
        status: progressPerc >= 100 ? 'Completed' : matchCamp.status,
        updatedAt: new Date().toISOString()
      };

      if (db) {
        try {
          await setDoc(doc(db, 'campaigns', campId), updatedCampaign);
        } catch (err) {
          console.warn("Firestore campaign stat write failed: ", err);
        }
      } else {
        setCampaigns(prev => prev.map(c => {
          if (c.id === campId) {
            return updatedCampaign;
          }
          return c;
        }));
      }
    }
  };

  // Update Specific Directory Submission Status
  const handleUpdateSubmissionStatus = async (
    submissionId: string, 
    newStatus: CampaignDirectorySubmission['status'],
    successCallback?: () => void
  ) => {
    let targetCampId = '';
    let updatedSub: CampaignDirectorySubmission | null = null;

    const currentSub = submissions.find(s => s.id === submissionId);
    if (!currentSub) return;

    targetCampId = currentSub.campaignId;
    let subUrl = currentSub.submittedUrl;
    if (newStatus === 'Verified' && !subUrl) {
      const dirObj = directories.find(x => x.id === currentSub.directoryId);
      subUrl = `https://${dirObj?.domain || 'directory.com'}/search?q=business-listings`;
    }

    updatedSub = {
      ...currentSub,
      status: newStatus,
      submittedUrl: subUrl,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'submissions', submissionId), updatedSub);
        // Prompt stats recalc
        const subSnapshotList = submissions.map(s => s.id === submissionId ? updatedSub! : s);
        setTimeout(() => recalculateCampaignStats(targetCampId, subSnapshotList), 80);
      } catch (err) {
        console.warn("Firestore submission update status failed: ", err);
      }
    } else {
      setSubmissions(prev => {
        const updated = prev.map(s => {
          if (s.id === submissionId) {
            return updatedSub!;
          }
          return s;
        });
        if (targetCampId) {
          setTimeout(() => recalculateCampaignStats(targetCampId, updated), 50);
        }
        return updated;
      });
    }

    // Check if moving to Manual Review, spawn a task!
    if (newStatus === 'Manual Review' || newStatus === 'Captcha Detected' || newStatus === 'Email Verification Needed') {
      const taskId = 't-' + Math.random().toString(36).substring(2, 9);
      const taskNotes = newStatus === 'Captcha Detected' 
        ? `Bypassing CAPTCHA block sequence suspended. Needs human operator verification.` 
        : newStatus === 'Email Verification Needed'
          ? `Confirmation link is pending trigger click inside client physical inbox.`
          : `Manual entry checklist required.`;

      const currentUid = user?.uid || 'demo-uid-sandbox';
      const newTask: ManualReviewTask = {
        id: taskId,
        campaignId: currentSub.campaignId,
        submissionId: currentSub.id,
        businessProfileId: campaigns.find(c => c.id === currentSub.campaignId)?.businessProfileId || '',
        directoryId: currentSub.directoryId,
        workspaceId: currentUid,
        issueType: newStatus === 'Captcha Detected' ? 'Captcha' : 'Needs human decision',
        priority: 'High',
        status: 'Pending',
        notes: taskNotes,
        createdAt: new Date().toISOString()
      };

      if (db) {
        try {
          await setDoc(doc(db, 'manualTasks', taskId), newTask);
        } catch (e) {
          console.warn("Firestore manual task creation failed: ", e);
        }
      } else {
        setManualTasks(prev => [newTask, ...prev]);
      }
    }

    if (successCallback) successCallback();
  };

  // Solve Human manual task board
  const handleResolveManualTask = async (taskId: string, resolveNotes?: string) => {
    const taskObj = manualTasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const updatedTask: ManualReviewTask = {
      ...taskObj,
      status: 'Resolved',
      notes: resolveNotes || taskObj.notes,
      resolvedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'manualTasks', taskId), updatedTask);
      } catch (e) {
        console.warn("Firestore manual task resolution failed: ", e);
      }
    } else {
      setManualTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return updatedTask;
        }
        return t;
      }));
    }

    // 2. Set listing status verified live
    handleUpdateSubmissionStatus(taskObj.submissionId, 'Verified');
    handleAddSubmissionLog(taskObj.submissionId, 'Manual Task resolved. Crawler synchronization confirmed live.', 'success');
  };

  const handleSkipManualTask = async (taskId: string) => {
    const taskObj = manualTasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const updatedTask: ManualReviewTask = {
      ...taskObj,
      status: 'Skipped',
      resolvedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'manualTasks', taskId), updatedTask);
      } catch (e) {
        console.warn("Firestore manual task skip failed: ", e);
      }
    } else {
      setManualTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return updatedTask;
        }
        return t;
      }));
    }

    handleUpdateSubmissionStatus(taskObj.submissionId, 'Skipped');
    handleAddSubmissionLog(taskObj.submissionId, 'Operator skipped manual review task.', 'warning');
  };

  // Filtered scoped collections to keep public vs private domains detached
  const currentUid = user?.uid || 'demo-uid-sandbox';
  const isRealUser = user?.isReal === true;

  const displayedBusinesses = isRealUser 
    ? businesses.filter(b => b.workspaceId === currentUid)
    : businesses;

  const displayedCampaigns = isRealUser
    ? campaigns.filter(c => c.workspaceId === currentUid)
    : campaigns;

  const displayedSubmissions = isRealUser
    ? submissions.filter(s => displayedCampaigns.some(c => c.id === s.campaignId))
    : submissions;

  const displayedManualTasks = isRealUser
    ? manualTasks.filter(t => displayedCampaigns.some(c => c.id === t.campaignId))
    : manualTasks;

  // Active Pending Counts for badges
  const pendingTasksCount = displayedManualTasks.filter(t => t.status === 'Pending').length;

  // RENDER DYNAMIC COMPONENT views multiplexer
  const renderCoreView = () => {
    if (activeView === 'dashboard') {
      return (
        <DashboardView 
          businesses={displayedBusinesses} 
          campaigns={displayedCampaigns} 
          directories={directories}
          submissions={displayedSubmissions}
          onChangeView={setActiveView}
          theme={theme}
          user={user}
        />
      );
    }

    if (activeView === 'businesses') {
      return (
        <BusinessesView 
          businesses={displayedBusinesses} 
          onAddBusiness={handleAddBusiness}
          onDeleteBusiness={handleDeleteBusiness}
          theme={theme}
        />
      );
    }

    if (activeView === 'businesses-new') {
      return (
        <BusinessesView 
          businesses={displayedBusinesses} 
          onAddBusiness={handleAddBusiness}
          theme={theme}
          // Directly launches in create wizard mode
        />
      );
    }

    if (activeView === 'directories') {
      return (
        <DirectoriesView 
          directories={directories} 
          theme={theme} 
          onImportDirectories={(newDirectories) => {
            setDirectories(prev => {
              const updated = [...newDirectories, ...prev];
              if (db) {
                newDirectories.forEach(async (d) => {
                  try {
                    await setDoc(doc(db, 'directories', d.id), d);
                  } catch (e) {
                    console.warn("Seeding directory failed: ", e);
                  }
                });
              }
              return updated;
            });
          }}
        />
      );
    }

    if (activeView === 'campaigns' || activeView === 'campaigns-new' || activeView.startsWith('campaign-')) {
      const isNew = activeView === 'campaigns-new';
      const subValue = isNew ? 'new' : (activeView === 'campaigns' ? 'list' : activeView);
      return (
        <CampaignsView 
          campaigns={displayedCampaigns}
          businesses={displayedBusinesses}
          directories={directories}
          submissions={displayedSubmissions}
          activeSubView={subValue}
          setActiveSubView={(val) => {
            if (val === 'list') setActiveView('campaigns');
            else if (val === 'new') setActiveView('campaigns-new');
            else setActiveView(val);
          }}
          onAddCampaign={handleAddCampaign}
          onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
          onAddSubmissionLog={handleAddSubmissionLog}
          theme={theme}
        />
      );
    }

    if (activeView === 'manual-review') {
      return (
        <ManualReviewView 
          tasks={displayedManualTasks} 
          businesses={displayedBusinesses} 
          directories={directories}
          onResolveTask={handleResolveManualTask}
          onSkipTask={handleSkipManualTask}
          theme={theme}
        />
      );
    }

    if (activeView === 'reports') {
      return (
        <ReportsView 
          campaigns={displayedCampaigns} 
          businesses={displayedBusinesses} 
          directories={directories} 
          submissions={displayedSubmissions} 
          theme={theme}
        />
      );
    }

    if (activeView === 'settings') {
      return (
        <SettingsView 
          user={user} 
          onUpdateUser={handleUpdateUser} 
          theme={theme} 
          onResetData={handleResetData}
        />
      );
    }

    if (activeView === 'verification-tracker') {
      return (
        <VerificationView 
          submissions={displayedSubmissions}
          businesses={displayedBusinesses}
          directories={directories}
          onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
          theme={theme}
          user={user}
        />
      );
    }

    if (activeView === 'architecture') {
      return <AboutView theme={theme} />;
    }

    if (activeView === 'help') {
      return <HelpView theme={theme} />;
    }

    // Default Fallback
    return <DashboardView businesses={displayedBusinesses} campaigns={displayedCampaigns} directories={directories} submissions={displayedSubmissions} onChangeView={setActiveView} theme={theme} />;
  };

  // CHECK MANDATORY EMAIL VERIFICATION GATE FOR AUTHENTICATED USER SESSIONS
  if (user && user.isReal && !user.isVerified) {
    return (
      <div className={`min-h-screen font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#070707] text-[#F4F4F5]' : 'bg-[#F7F8FA] text-[#111827]'
      }`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center animate-pulse">
              <Mail className="w-8 h-8" />
            </div>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight leading-none mb-3">
            Please Verify Your Email
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto mb-6">
            An email verification link has been sent to your registered address <strong className="text-sky-400">{user.email}</strong>. Please confirm your email address to enter your secure, isolated workspace.
          </p>
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-gray-400 mb-8 max-w-sm mx-auto">
            <span>* Real-time Firebase UID-scoped sandbox workspaces are kept extremely safe through mandatory email-checks.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => {
                if (auth?.currentUser) {
                  auth.currentUser.reload().then(() => {
                    setUser(prev => prev ? { ...prev, isVerified: auth.currentUser?.emailVerified } : null);
                  });
                } else {
                  setUser(prev => prev ? { ...prev, isVerified: true } : null);
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white cursor-pointer shadow-sm"
            >
              I Have Verified My Email
            </button>
            <button
              onClick={() => {
                setUser(null);
                setActiveView('landing');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-white/[0.08] hover:bg-white/[0.02] text-gray-300 cursor-pointer"
            >
              Back to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDERS MAIN LANDING or AUTH SCREENS
  if (activeView === 'landing') {
    return (
      <LandingPage 
        onStartDemo={() => {
          // Preset auth login
          setUser({ name: 'Shaheer Hussain Jafri', email: 'demo.operator@citationpilot.com', isReal: false, isVerified: true, uid: 'demo-uid-sandbox' });
          setActiveView('dashboard');
        }} 
        onGoToLogin={() => setActiveView('login')} 
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  if (activeView === 'login') {
    return (
      <AuthPage 
        onLoginSuccess={handleLoginSuccess} 
        onGoBack={() => setActiveView('landing')} 
        theme={theme}
      />
    );
  }

  // STANDARD AUTH PREVIEW WORKBENCH SHELL
  return (
    <AppShell 
      activeView={activeView} 
      onChangeView={setActiveView} 
      user={user} 
      onLogout={handleLogout} 
      theme={theme} 
      setTheme={setTheme}
      reviewCount={pendingTasksCount}
    >
      {renderCoreView()}
    </AppShell>
  );
}
