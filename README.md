# CitationPilot 🧭

**Local SEO Citation Automation Workbench (Operator Sandbox)**

---

## 1. CitationPilot

CitationPilot is a Local SEO Citation Automation Workbench built as a proof-of-work system for directory discovery, submission workflow design, manual review queues, email verification, Firebase Auth, Firestore rules, and UID-scoped private workspaces. 

Designed for SEO agencies, local marketing specialists, and automations engineers, CitationPilot is an interactive frontend workbench that demonstrates how complex directory submissions can be structured, modeled, and operated at scale under a unified operational hub.

---

## 2. Overview

Local citation indexation—placing consistent Name, Address, and Phone (NAP) details across directories like Google Business Profile, Bing Places, Yelp, YellowPages, etc.—is critical for Local SEO ranking authority. However, manual directory submission is tedious and error-prone, while automated submission scripts often fail silently when hitting edge-case interactive gates.

CitationPilot acts as an operator workspace where automated workflows and human operators collaborate. The system models directory listings, tracks ongoing campaigns, identifies directory requirements, and coordinates manual operator resolution for complex gates, ensuring high-fidelity delivery of local listings.

---

## 3. Problem

Fully automated scraping and automated headless injection software often fail due to:
* **Interactive Challenges**: Anti-bot protections (like CAPTCHAs or Cloudflare Turnstile).
* **Identity Gates**: Mandatory live SMS codes, PIN verification postcards, and multi-factor or phone-based verification.
* **Directory Ambiguities**: Paywalls, strict category mismatch blocks, or duplicate listings requiring unique manual decisions.

To achieve 100% submission accuracy, systems require a hybrid approach: background automation nodes handle the repetitive standard data insertion task, while blockages are seamlessly escalated to human-in-the-loop review queues.

---

## 4. System Flow

```
+--------------------------------------------------------------+
|                   1. PROFILE CREATION                        |
|       Define Legal Entity Name, Address, & Phone (NAP)       |
+------------------------------+-------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                   2. CAMPAIGN INITIATION                     |
|           Select Opportunities & Match Target Scope          |
+------------------------------+-------------------------------+
                               |
                               v
+------------------------------+-------------------------------+
|         3. AUTOMATED BACKGROUND PIPELINE (Planned)           |
|         Headless crawlers trigger directory registrations     |
+------------------------------+-------------------------------+
                               |
          +--------------------+--------------------+
          | (Success)                               | (Gated Block)
          v                                         v
+------------------------+                +-------------------------+
|  4A. VERIFIED CITATION |                | 4B. MANUAL REVIEW QUEUE |
|                        |                |                         |
|  Logged directly index |                | CAPTCHAs, Cloudflare,   |
|  and live URLs captured|                | paywall, duplicate or   |
|  for real-time tracking|                | phone/postcard blockers |
+------------------------+                | routed to human operator|
                                          +------------+------------+
                                                       |
                                                       v
                                          +-------------------------+
                                          |   5. OPERATOR SOLVES    |
                                          |                         |
                                          | Solved manually via the |
                                          | Human-in-the-loop board |
                                          +-------------------------+
```

---

## 5. Features

* **Global Directory Index**: Access and leverage a pre-configured reference catalog of 1,840+ local directory opportunities graded by Domain Authority (DA) and submission complexity.
* **Structured Business Profile Engine**: Standardize local business legal structures, core categories, Google Maps geocodes, and hours.
* **Interactive Campaign Wizard**: Provision location-scoped campaigns targeting specified local directories dynamically.
* **Live Submission Detail Trackers**: Drill down on individual campaign workflows to view real-time automated crawler logs, response status, and error states.
* **Human-in-the-Loop review**: Seamlessly track and claim tasks failing the automated pipeline due to interactive, billing, or security blocks.
* **Email Verification Tracker**: Centralize client email routing verification checks with active workflow indicators.
* **Agency-Ready Report Compilation**: Instantly generate clean, printable client reports and live citation CSV logs.

---

## 6. Tech Stack

* **Frontend Library**: React 18+ (Vite, TypeScript Strict Mode)
* **Design & Layout**: Tailwind CSS
* **Animations**: Framer Motion (`motion/react`) for smooth, reactive transition states
* **Icons**: Lucide React
* **Client state Database**: Offline-first client-side state synchronized to browser local storage.
* **Cloud Database & Auth**: Google Firebase (Firestore and Firebase Authentication)

---

## 7. Demo Mode vs. Authenticated Workspace

CitationPilot operates in two distinct execution environments:

1. **Public Demo Mode (Local Storage Fallback)**:
   * Accessible instantly without authentication.
   * Leverages browser local storage with simulated workflows.
   * Populates the workspace with elaborate pre-seeded sample data (e.g., *Demo Dental Campaign*, *Demo Legal Campaign*, *Demo Local Business Campaign*, simulated timeline logs, metrics, and profiles).
2. **Authenticated Private Mode (Secure Cloud Workspace)**:
   * Activated when signing in with a registered account.
   * Employs real Firebase Auth with standard email confirmation.
   * **Starts completely clean and empty** (0 active campaigns, 0 submissions, empty logs, empty checklists) to guarantee privacy and security boundaries for real workspace production operations.

---

## 8. Firebase Auth & Firestore Security

In authenticated mode, all active collections are securely locked behind Firestore Rules to prevent cross-tenant data leaks and unauthorized public modifications:
* **Strict UID-Scoping**: Read/write access is restricted to authenticated owners matching the `workspaceId` of each document.
* **Anonymous/Public Write Blocks**: No public read/write configurations allowed for core private directories.
* **Read-only Reference Library**: The `directories` collection serves as a global, shared directory directory reference library. Standard users have read-only access, while creation, editing, and deleting capabilities are restricted to the system.

---

## 9. Local Development

To run this application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/shaheerhus85/citationpilot.git
   cd citationpilot
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Launch the hot-reloading Vite dev server:
   ```bash
   npm run dev
   ```

4. Compile a static optimized build for production assets:
   ```bash
   npm run build
   ```

---

## 10. Firebase Configuration

Client-side initialization configures dynamically using the applet configuration manifest:
1. Ensure the Firebase App configuration file is placed under `/src/firebase-applet-config.json` in the web application root.
2. The config file should contain your standard client SDK initialization parameters:
   ```json
   {
     "apiKey": "YOUR_FIREBASE_API_KEY",
     "authDomain": "YOUR_FIREBASE_AUTH_DOMAIN",
     "projectId": "YOUR_FIREBASE_PROJECT_ID",
     "storageBucket": "YOUR_FIREBASE_STORAGE_BUCKET",
     "messagingSenderId": "YOUR_FIREBASE_SENDER_ID",
     "appId": "YOUR_FIREBASE_APP_ID",
     "firestoreDatabaseId": "your-database-id"
   }
   ```
3. The Firebase client SDK imports this config dynamically to establish isolated user sessions and Firestore listeners.

---

## 11. Deployment

Production builds compile down to efficient, search-crawler friendly static SPA files outputting to the `dist/` workspace. Simply upload the static assets inside `dist/` to any static hosting service (Firebase Hosting, Cloud Run, Vercel, Netlify) to execute live client citation campaigns.

---

## 12. Future Backend Phase

As a proof-of-work project, active automation crawlers are currently represented as a high-fidelity simulator. Future backend stages include:
* **Custom 6-digit email OTP verification using backend functions and transactional email service.**
* **Playwright Worker Node Cluster**: A scalable Express service running headless Chrome instances to register accounts, enter NAP coordinates, verify confirmation strings, and record resulting crawl links directly to Firestore.

---

## 13. Author

**Shaheer Hussain Jafri**  
*AI-assisted developer and automation-focused systems builder.*  
📧 [shaheerhus85@gmail.com](mailto:shaheerhus85@gmail.com)
