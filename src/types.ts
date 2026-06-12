export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  workspaceId: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'Starter' | 'Pro' | 'Agency';
  ownerId: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  workspaceId: string;
  businessName: string;
  legalName: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mainCategory: string;
  secondaryCategories: string;
  shortDescription: string;
  longDescription: string;
  openingHours: string; // e.g., "Mon-Fri: 9AM-5PM"
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  youtube?: string;
  twitter?: string;
  logoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Directory {
  id: string;
  name: string;
  domain: string;
  country: string;
  category: string;
  authorityScore: number;
  submissionType: 'Manual' | 'Automated-ready' | 'Email verification needed' | 'High priority';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Active' | 'Needs review' | 'Deprecated';
  automationReady: boolean;
  requiresEmailVerification: boolean;
  captchaLikely: boolean;
  freeOrPaid: 'Free' | 'Paid';
  notes: string;
  lastChecked: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  businessProfileId: string;
  name: string;
  targetCountry: string;
  targetCity: string;
  category: string;
  status: 'Draft' | 'Queued' | 'Running' | 'Paused' | 'Completed' | 'Failed' | 'Needs Review';
  mode: 'Manual tracking' | 'Assisted workflow' | 'Automation-ready';
  totalDirectories: number;
  submittedCount: number;
  verifiedCount: number;
  failedCount: number;
  manualReviewCount: number;
  progress: number; // percentage (0-100)
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface CampaignDirectorySubmission {
  id: string;
  campaignId: string;
  directoryId: string;
  workspaceId: string;
  status: 'Pending' | 'Queued' | 'In Progress' | 'Submitted' | 'Verified' | 'Failed' | 'Duplicate Found' | 'Captcha Detected' | 'Email Verification Needed' | 'Manual Review' | 'Skipped';
  attempts: number;
  lastAttemptAt?: string;
  submittedUrl?: string;
  notes?: string;
  issueType?: string;
  logs: SubmissionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface ManualReviewTask {
  id: string;
  campaignId: string;
  submissionId: string;
  businessProfileId: string;
  directoryId: string;
  workspaceId: string;
  issueType: 'Captcha' | 'Email verification' | 'Duplicate listing' | 'Missing field' | 'Directory changed' | 'Login required' | 'Paid listing' | 'Form error' | 'Needs human decision';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Resolved' | 'Skipped';
  notes: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Report {
  id: string;
  campaignId: string;
  workspaceId: string;
  summary: string;
  generatedAt: string;
  exportUrl?: string;
}
