import { BusinessProfile, Directory, Campaign, CampaignDirectorySubmission, ManualReviewTask } from './types';

export const INITIAL_BUSINESSES: BusinessProfile[] = [
  {
    id: 'b1',
    workspaceId: 'w1',
    businessName: 'Demo Dental Campaign',
    legalName: 'Demo Dental Campaign PC (Simulated Record)',
    website: 'https://www.apex-dentistry-example.com',
    email: 'contact@apex-dentistry-example.com',
    phone: '+1 (555) 234-5678',
    address: '450 Alpine Summit Dr, Suite 100',
    city: 'Denver',
    state: 'CO',
    country: 'United States',
    postalCode: '80202',
    mainCategory: 'Dentist',
    secondaryCategories: 'Cosmetic Dentist, Orthodontist, Dental Clinic',
    shortDescription: 'Modern, high-comfort family dental care in downtown Denver. [Demo Profile]',
    longDescription: 'Our simulated premium dental clinic offers state-of-the-art general, cosmetic, and pediatric dentistry services. This is a simulated demo profile demonstrating full local search optimization features.',
    openingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    facebook: 'https://facebook.com/apexdentistryco',
    instagram: 'https://instagram.com/apexdentistryco',
    linkedIn: 'https://linkedin.com/company/demo-dental-campaign',
    twitter: 'https://twitter.com/apexdentistryco',
    logoUrl: '',
    notes: 'Primary Denver headquarters. Simulated sandbox address. Please use consistent ZIP code 80202.',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'b2',
    workspaceId: 'w1',
    businessName: 'Demo Legal Campaign',
    legalName: 'Demo Legal Campaign LLC (Simulated Record)',
    website: 'https://www.sovereign-law-example.com',
    email: 'info@sovereign-law-example.com',
    phone: '+1 (206) 555-0199',
    address: '1200 Fifth Ave, Floor 14',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    postalCode: '98101',
    mainCategory: 'Corporate Lawyer',
    secondaryCategories: 'Real Estate Attorney, Estate Planning',
    shortDescription: 'Bespoke counsel for intellectual property, corporate structuring, and real estate. [Demo Profile]',
    longDescription: 'At our simulated premier corporate advocacy group, we represent startups, tech leaders, and property developers. This is a simulated demo profile demonstrating full local search optimization features.',
    openingHours: 'Mon-Thur: 9:00 AM - 6:00 PM, Fri: 9:00 AM - 4:00 PM',
    facebook: 'https://facebook.com/sovereignlawseattle',
    logoUrl: '',
    notes: 'Always double check suite numbers. Simulated sandbox address.',
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'b3',
    workspaceId: 'w1',
    businessName: 'Demo Local Business Campaign',
    legalName: 'Demo Local Business Campaign LLC (Simulated Record)',
    website: 'https://www.velobikes-seattle-example.com',
    email: 'hello@velobikes-example.com',
    phone: '+1 (206) 555-4321',
    address: '815 Pine St',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    postalCode: '98101',
    mainCategory: 'Bicycle Shop',
    secondaryCategories: 'Espresso Bar, Bicycle Repair, Sports Supplies',
    shortDescription: 'Seattle’s community bicycle hub supplying custom builds, premium espresso, and quick repairs. [Demo Profile]',
    longDescription: 'We build custom road, gravel, and urban commuter bikes while brewing locally-sourced coffee. This is a simulated demo profile demonstrating full local search optimization features.',
    openingHours: 'Mon-Sat: 7:00 AM - 7:00 PM, Sun: 8:00 AM - 5:00 PM',
    instagram: 'https://instagram.com/velobikescoffee',
    createdAt: '2026-05-20T14:30:00Z',
    updatedAt: '2026-05-20T14:30:00Z'
  }
];

export const INITIAL_DIRECTORIES: Directory[] = [
  {
    id: 'd1',
    name: 'Google Business Profile',
    domain: 'google.com/business',
    country: 'Global',
    category: 'General',
    authorityScore: 100,
    submissionType: 'High priority',
    difficulty: 'Hard',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: true,
    freeOrPaid: 'Free',
    notes: 'Absolute must-have. Requires postal verification code or video verification in most regions.',
    lastChecked: '2026-06-01'
  },
  {
    id: 'd2',
    name: 'Bing Places',
    domain: 'bingplaces.com',
    country: 'Global',
    category: 'General',
    authorityScore: 94,
    submissionType: 'High priority',
    difficulty: 'Medium',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: false,
    freeOrPaid: 'Free',
    notes: 'Imports directly from Google Business Profile. Quick email/SMS pin verification is standard.',
    lastChecked: '2026-06-02'
  },
  {
    id: 'd3',
    name: 'Yelp',
    domain: 'yelp.com',
    country: 'US / CA / UK',
    category: 'Food, Local, Services',
    authorityScore: 93,
    submissionType: 'Manual',
    difficulty: 'Medium',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: true,
    freeOrPaid: 'Free',
    notes: 'High conversion value directory. Manual verification is strict; phone code often required.',
    lastChecked: '2026-06-03'
  },
  {
    id: 'd4',
    name: 'Foursquare',
    domain: 'foursquare.com',
    country: 'Global',
    category: 'General, Venues',
    authorityScore: 92,
    submissionType: 'Automated-ready',
    difficulty: 'Easy',
    status: 'Active',
    automationReady: true,
    requiresEmailVerification: false,
    captchaLikely: false,
    freeOrPaid: 'Free',
    notes: 'Feeds hundreds of smaller location applications. Automation-ready via API/Browser worker.',
    lastChecked: '2026-05-28'
  },
  {
    id: 'd5',
    name: 'Hotfrog',
    domain: 'hotfrog.com',
    country: 'Multi-regional',
    category: 'B2B, Services',
    authorityScore: 71,
    submissionType: 'Automated-ready',
    difficulty: 'Easy',
    status: 'Active',
    automationReady: true,
    requiresEmailVerification: true,
    captchaLikely: true,
    freeOrPaid: 'Free',
    notes: 'Excellent B2B authority depth. Requires email click confirmation.',
    lastChecked: '2026-05-25'
  },
  {
    id: 'd6',
    name: 'Brownbook',
    domain: 'brownbook.net',
    country: 'Global',
    category: 'General',
    authorityScore: 68,
    submissionType: 'Automated-ready',
    difficulty: 'Easy',
    status: 'Active',
    automationReady: true,
    requiresEmailVerification: false,
    captchaLikely: false,
    freeOrPaid: 'Free',
    notes: 'No-fuss listing creator. Instantly updates citation index.',
    lastChecked: '2026-06-04'
  },
  {
    id: 'd7',
    name: 'Cylex',
    domain: 'cylex-international.com',
    country: 'Multi-regional',
    category: 'Local search',
    authorityScore: 74,
    submissionType: 'Automated-ready',
    difficulty: 'Easy',
    status: 'Active',
    automationReady: true,
    requiresEmailVerification: true,
    captchaLikely: false,
    freeOrPaid: 'Free',
    notes: 'Accepts rich listing structures including images and categories.',
    lastChecked: '2026-05-19'
  },
  {
    id: 'd8',
    name: 'Local.com',
    domain: 'local.com',
    country: 'US',
    category: 'Local Search',
    authorityScore: 75,
    submissionType: 'Manual',
    difficulty: 'Medium',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: true,
    freeOrPaid: 'Free',
    notes: 'Has strong geographic citation weight inside United States.',
    lastChecked: '2026-05-15'
  },
  {
    id: 'd9',
    name: 'Yellow Pages',
    domain: 'yellowpages.com',
    country: 'US',
    category: 'Business Listings',
    authorityScore: 89,
    submissionType: 'Manual',
    difficulty: 'Hard',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: true,
    freeOrPaid: 'Free',
    notes: 'Strong local weights, heavily pushes paid ad options during manual claim, proceed carefully.',
    lastChecked: '2026-06-01'
  },
  {
    id: 'd10',
    name: 'Chamber of Commerce',
    domain: 'chamberofcommerce.com',
    country: 'US / Global',
    category: 'B2B, Local Authority',
    authorityScore: 81,
    submissionType: 'Manual',
    difficulty: 'Medium',
    status: 'Active',
    automationReady: false,
    requiresEmailVerification: true,
    captchaLikely: false,
    freeOrPaid: 'Paid',
    notes: 'Highly valuable commercial backlink. Free profile tier is limited but standard.',
    lastChecked: '2026-06-03'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    workspaceId: 'w1',
    businessProfileId: 'b1',
    name: 'Demo Dental Campaign',
    targetCountry: 'United States',
    targetCity: 'Denver',
    category: 'Dentist',
    status: 'Running',
    mode: 'Automation-ready',
    totalDirectories: 8,
    submittedCount: 3,
    verifiedCount: 2,
    failedCount: 1,
    manualReviewCount: 2,
    progress: 62,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-05T15:30:00Z'
  },
  {
    id: 'c2',
    workspaceId: 'w1',
    businessProfileId: 'b2',
    name: 'Demo Legal Campaign',
    targetCountry: 'United States',
    targetCity: 'Seattle',
    category: 'Legal Services',
    status: 'Queued',
    mode: 'Assisted workflow',
    totalDirectories: 5,
    submittedCount: 0,
    verifiedCount: 0,
    failedCount: 0,
    manualReviewCount: 0,
    progress: 0,
    createdAt: '2026-06-04T09:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z'
  },
  {
    id: 'c3',
    workspaceId: 'w1',
    businessProfileId: 'b3',
    name: 'Demo Local Business Campaign',
    targetCountry: 'United States',
    targetCity: 'Seattle',
    category: 'Bicycle Hub',
    status: 'Completed',
    mode: 'Manual tracking',
    totalDirectories: 6,
    submittedCount: 6,
    verifiedCount: 5,
    failedCount: 0,
    manualReviewCount: 1,
    progress: 100,
    createdAt: '2026-05-20T11:00:00Z',
    updatedAt: '2026-06-02T17:00:00Z'
  }
];

export const INITIAL_SUBMISSIONS: CampaignDirectorySubmission[] = [
  // Campaign 1 submissions
  {
    id: 's1',
    campaignId: 'c1',
    directoryId: 'd1', // Google
    workspaceId: 'demo-uid-sandbox',
    status: 'Manual Review',
    attempts: 1,
    lastAttemptAt: '2026-06-02T11:15:00Z',
    notes: 'Verification code was sent via postal postcard to Chicago/Denver Demo coordinates. Awaiting code receipt in sandbox.',
    issueType: 'Needs human decision',
    logs: [
      { timestamp: '2026-06-01T10:05:00Z', type: 'info', message: 'Campaign c1 initialized.' },
      { timestamp: '2026-06-01T10:10:00Z', type: 'info', message: 'Analyzing Google Business Profile requirements for Demo Dental Campaign.' },
      { timestamp: '2026-06-02T11:00:00Z', type: 'warning', message: 'Simulated manual form flow initiated.' },
      { timestamp: '2026-06-02T11:15:00Z', type: 'warning', message: 'Google sent simulated verification mailer. Pending manual confirmation.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-02T11:15:00Z'
  },
  {
    id: 's2',
    campaignId: 'c1',
    directoryId: 'd2', // Bing
    workspaceId: 'demo-uid-sandbox',
    status: 'Verified',
    attempts: 1,
    lastAttemptAt: '2026-06-02T14:30:00Z',
    submittedUrl: 'https://bing.com/places/apex-dentistry-denver-co',
    notes: 'Authenticated via Google account sync quickly. Live!',
    logs: [
      { timestamp: '2026-06-01T10:05:00Z', type: 'info', message: 'Bing Places sync activated.' },
      { timestamp: '2026-06-02T14:00:00Z', type: 'info', message: 'Initiating Direct API Sync.' },
      { timestamp: '2026-06-02T14:30:00Z', type: 'success', message: 'Sync successful. Listing verified alive.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-02T14:30:00Z'
  },
  {
    id: 's3',
    campaignId: 'c1',
    directoryId: 'd3', // Yelp
    workspaceId: 'demo-uid-sandbox',
    status: 'Captcha Detected',
    attempts: 2,
    lastAttemptAt: '2026-06-03T16:20:00Z',
    notes: 'Faced cloudflare check and strict Arkose captcha. Sent to manual review.',
    issueType: 'Captcha',
    logs: [
      { timestamp: '2026-06-01T10:05:00Z', type: 'info', message: 'Yelp queued.' },
      { timestamp: '2026-06-03T16:00:00Z', type: 'info', message: 'Worker spawned to Yelp.' },
      { timestamp: '2026-06-03T16:15:00Z', type: 'warning', message: 'Arkose Captcha challenge presented on signup.' },
      { timestamp: '2026-06-03T16:20:00Z', type: 'error', message: 'Task routed to Human Manual Review Queue.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-03T16:20:00Z'
  },
  {
    id: 's4',
    campaignId: 'c1',
    directoryId: 'd4', // Foursquare
    workspaceId: 'demo-uid-sandbox',
    status: 'Verified',
    attempts: 1,
    lastAttemptAt: '2026-06-01T10:45:00Z',
    submittedUrl: 'https://foursquare.com/v/apex-family-dentistry-denver-co',
    notes: 'Success. API generated instantly.',
    logs: [
      { timestamp: '2026-06-01T10:05:00Z', type: 'info', message: 'Foursquare job started.' },
      { timestamp: '2026-06-01T10:25:00Z', type: 'info', message: 'Posting listing structured bundle to Foursquare.' },
      { timestamp: '2026-06-01T10:45:00Z', type: 'success', message: 'Foursquare published citation live.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:45:00Z'
  },
  {
    id: 's5',
    campaignId: 'c1',
    directoryId: 'd5', // Hotfrog
    workspaceId: 'demo-uid-sandbox',
    status: 'Email Verification Needed',
    attempts: 1,
    lastAttemptAt: '2026-06-04T12:00:00Z',
    notes: 'Please open contacted client inbox or proxy inbox to confirm.',
    issueType: 'Email verification',
    logs: [
      { timestamp: '2026-06-04T11:45:00Z', type: 'info', message: 'Hotfrog automated submission posted.' },
      { timestamp: '2026-06-04T12:00:00Z', type: 'warning', message: 'Hotfrog verification request sent to contact@apex-dentistry-example.com.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-04T12:00:00Z'
  },
  {
    id: 's6',
    campaignId: 'c1',
    directoryId: 'd6', // Brownbook
    workspaceId: 'demo-uid-sandbox',
    status: 'Submitted',
    attempts: 1,
    lastAttemptAt: '2026-06-04T14:10:00Z',
    submittedUrl: 'https://brownbook.net/business/apex-family-dentistry',
    notes: 'Creation worked. Pending index crawler update.',
    logs: [
      { timestamp: '2026-06-04T14:00:00Z', type: 'info', message: 'Submitting Brownbook automated listing...' },
      { timestamp: '2026-06-04T14:10:00Z', type: 'success', message: 'Successfully generated profile. Awaiting full site index.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-04T14:10:00Z'
  },
  {
    id: 's7',
    campaignId: 'c1',
    directoryId: 'd7', // Cylex
    workspaceId: 'demo-uid-sandbox',
    status: 'Submitted',
    attempts: 1,
    lastAttemptAt: '2026-06-04T15:20:00Z',
    submittedUrl: 'https://cylex.com/business/denver/apex-family-dentistry',
    notes: 'Structured data loaded successfully.',
    logs: [
      { timestamp: '2026-06-04T15:00:00Z', type: 'info', message: 'Preparing payload.' },
      { timestamp: '2026-06-04T15:20:00Z', type: 'success', message: 'Cylex submission finished successfully.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-04T15:20:00Z'
  },
  {
    id: 's8',
    campaignId: 'c1',
    directoryId: 'd8', // Local.com
    workspaceId: 'demo-uid-sandbox',
    status: 'Failed',
    attempts: 3,
    lastAttemptAt: '2026-06-05T11:00:00Z',
    notes: 'Zip code boundary check failed. Address format rejected by directory’s strict validation parser.',
    issueType: 'Form error',
    logs: [
      { timestamp: '2026-06-05T10:15:00Z', type: 'info', message: 'Local.com manual track started.' },
      { timestamp: '2026-06-05T10:45:00Z', type: 'error', message: 'Field parsing error on Local.com: Postal Code does not match internal database lookup!' },
      { timestamp: '2026-06-05T11:00:00Z', type: 'error', message: 'Failed after multiple retry loops.' }
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-05T11:00:00Z'
  }
];

export const INITIAL_MANUAL_REVIEW_TASKS: ManualReviewTask[] = [
  {
    id: 't1',
    campaignId: 'c1',
    submissionId: 's3', // Yelp
    businessProfileId: 'b1',
    directoryId: 'd3',
    workspaceId: 'demo-uid-sandbox',
    issueType: 'Captcha',
    priority: 'High',
    status: 'Pending',
    notes: 'Yelp Cloudflare challenge stopped the browser worker. Complete validation manually to resume simulated workflow.',
    createdAt: '2026-06-03T16:20:00Z'
  },
  {
    id: 't2',
    campaignId: 'c1',
    submissionId: 's5', // Hotfrog
    businessProfileId: 'b1',
    directoryId: 'd5',
    workspaceId: 'demo-uid-sandbox',
    issueType: 'Email verification',
    priority: 'Medium',
    status: 'Pending',
    notes: 'An email verification link was sent. Check simulated email inbox to verify the profile inside this demo.',
    createdAt: '2026-06-04T12:00:00Z'
  },
  {
    id: 't3',
    campaignId: 'c1',
    submissionId: 's1', // Google Business
    businessProfileId: 'b1',
    directoryId: 'd1',
    workspaceId: 'demo-uid-sandbox',
    issueType: 'Needs human decision',
    priority: 'High',
    status: 'Pending',
    notes: 'Simulated postcard has been initiated for Demo Dental Campaign. Enter the code to trigger simulated completion.',
    createdAt: '2026-06-02T11:15:00Z'
  }
];
