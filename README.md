# CitationPilot 🧭

**Local SEO Citation Automation Workbench (Operator Sandbox & Developer Showcase)**

CitationPilot is a high-fidelity, proof-of-work developer prototype designed to demonstrate elegant local citation optimization workflows. Crafted specifically for search engine optimization (SEO) agencies and marketing specialists, this system focuses on maintaining absolute Name, Address, and Phone (NAP) parity across global local business directories to optimize physical business search visibility.

The primary sandbox dashboard allows recruiters and technical leads to evaluate pre-seeding logic, manual review tasks queues (human-in-the-loop CAPTCHA bypass workflows), automated email checklist runs, directory index metrics, and print-ready agency CSV reports completely inside the browser.

---

## 🛠️ Technological Architecture

- **Core Framework & Runtime**: React 18+ with Vite and TypeScript (Strict Mode).
- **Styling Architecture**: Tailwind CSS (Native utilities with elegant, dark cosmic styling as primary).
- **Fluid Layout Animations**: Framer Motion (`motion/react`) for smooth, non-intrusive transition states.
- **Component Icons Library**: Lucide React.
- **Durable Local Storage Persistence**: State synchronization immediately maps to the browser's `localStorage` index. This guarantees session history remains intact across manual system reloads.
- **Optional Firebase Sync Adapter**: Full on-snapshot listeners are pre-wired for Google Cloud Firestore. Loading keys in `.env` automatically promotes the workflow from offline sandbox mode into a live cloud-synchronized system.

---

## 🧭 Functional Workflow Outline

1. **Workspace Profile Setup**:
   Define detailed local business attributes including legal entity names, primary/secondary indexing categories, Google Business Profile markers, short/long descriptions, and exact phone/suite vectors.

2. **Automated Submission Pipeline (Planned Phase)**:
   The operator launches a Campaign aligning a business profile to directory targets. In production, this trigger notifies a headless **Playwright Crawler Node Cluster** which performs the following:
   - Automated registration and profile fields injection.
   - Polling for e-mail link validation threads.
   - Identification of blocking verification challenges.

3. **Human-in-the-Loop Manual Review Queue (Active Sandbox)**:
   When automated crawlers encounter anti-scraping protections (e.g., Arkose, Cloudflare Turnstile, phone SMS, or physical coordinate PIN postcards), rather than failing the process, CitationPilot routes the task to the **Manual Review Queue**. 
   - Operators can claim the thread, resolve the specific challenge in secure visual frames, and trigger continuation.

4. **Agency Performance Reporting**:
   Download instantly compiled CSV reports tracking verified live citation links, authority indices, and real-time logs to deliver to clients.

---

## 🔒 Demo Mode vs. Authenticated Workspace

CitationPilot supports two distinct operational modes designed for developer review and isolated sandbox testing:

1. **Public Demo Mode (No-Login Fallback)**:
   - **Identity**: Preloaded automatically as `Shaheer Hussain Jafri` inside the dynamic **Proof-of-work Sandbox**.
   - **State Isolation**: Operates using browser `localStorage` populated by generic mock campaigns (e.g. *Demo Dental Campaign*, *Demo Legal Campaign*) and simulated verification tasks.
   - **Wording & Clarity**: Clearly labeled with simulated logs and sample workflows to avoid confusion.

2. **Authenticated Private Mode (Firestore Scoped)**:
   - **Sign-In & Verification**: Secured using real Firebase Authentication (where configured).
   - **Mandatory Gating**: New sign-ups are greeted by a friendly, mandatory **Email Verification Gating View**. The operator must verify their email address before they are granted entry into any dashboards or workspaces.
   - **Private Workspace Scoping**: All custom added profiles, campaigns, and review items are strictly scoped by the authenticated user's Firebase UID. Users will start with a fully clean, private workspace disconnected from the public demo state, stored securely in Firebase.

---

## 🚀 Native Local Storage & Cloud Fallbacks

To ensure smooth "zero-install" developer review, the application functions autonomously using browser memory powered by pre-wired initial agency mock data. 

To enable Firebase Cloud synchronization:
1. Configure a Firestore database on Spark/Blaze plan.
2. Initialize collections `businesses`, `directories`, `campaigns`, `submissions`, and `manualTasks`.
3. Add the key values inside a `.env` file at root:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

---

## 📝 Future Improvements & Planned Backend Phase

- **Custom 6-digit email OTP verification using backend functions and transactional email service.**
- **Headless Crawlers**: Integration of an isolated Node.js Express microservice running custom **Playwright** scripts. The service will receive JSON configurations, run headless Chrome instances, and report real-time progress events back to Firestore collections.
- **Prototype Status**: **Proof-of-Work Interactive Front-End Workbench Demo**. All state alterations, directory CSV uploads/validations, review items approvals, and live logs simulation occur directly in client storage.
- **Author**: AI Coding Agent on behalf of Developer Showcase.
- **License**: Apache-2.0.
