# CitationPilot Architecture

## Overview
CitationPilot is a local SEO citation automation SaaS built with:

- FastAPI + SQLAlchemy backend
- SQLite primary database
- Next.js 14 frontend
- Playwright-based automation worker
- Gmail SMTP/IMAP for outbound contact + inbox verification
- Manual operator queue for CAPTCHA/login-blocked submissions

## Runtime Flow
1. User signs up and verifies email.
2. User creates a business profile.
3. User starts a campaign.
4. Backend selects directories and creates `directory_submissions`.
5. Worker inspects each directory and marks it `submitted`, `failed`, or `manual_required`.
6. Manual queue surfaces blocked rows for operator completion.
7. Verification inbox polls email and stores verification events.

## Data Model
- `users`
- `business_profiles`
- `directories`
- `submission_requests`
- `directory_submissions`
- `manual_submission_tasks`
- `temp_email_accounts`
- `submission_attempt_logs`
- `verification_emails`

## Design Notes
- Generic automation is retained for low-complexity directories.
- Tier-1 and CAPTCHA-heavy directories require manual or adapter-based handling.
- Campaign metrics are calculated from normalized submission statuses.
