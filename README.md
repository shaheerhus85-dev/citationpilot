# CitationPilot

CitationPilot is a local SEO citation automation SaaS built with FastAPI, SQLAlchemy, SQLite, Next.js, Tailwind CSS, and Playwright. The product combines automated directory submission workflows with a manual operator queue for CAPTCHA-protected or login-blocked directories.

## What the project includes

- JWT authentication with email verification
- Business profile management for reusable NAP data
- Campaign creation with recommended directory selection
- Background worker processing for pending submissions
- Manual queue for directories that require human review
- Gmail SMTP contact and notification delivery
- Mail.tm disposable inbox support for verification workflows
- Dashboard, analytics, campaign detail, profile, and manual queue UIs

## Project structure

```text
seo-citation-saas/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── automation/
│   │   └── playwright_engine.py
│   ├── data/
│   │   └── directories.csv
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── next.config.js
│   └── .env.example
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── README.md
```

## Quick start

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
copy .env.example .env
python run.py
```

Backend runs on `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Required backend environment variables

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET=your-secret-key-minimum-32-characters-long-required
JWT_ALGORITHM=HS256
FRONTEND_URL=http://localhost:3000

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
CONTACT_RECEIVER_EMAIL=shaheerhus85@gmail.com

ENABLE_BACKGROUND_WORKERS=true
WORKER_BATCH_SIZE=5
WORKER_INTERVAL_SECONDS=60

TEMP_EMAIL_PROVIDER=mail_tm
MANUAL_QUEUE_ENABLED=true
STORE_FAILURE_SCREENSHOTS=true
MAX_SUBMISSION_RETRIES=3
```

## Key routes

### Frontend

- `/` landing page
- `/login` sign in
- `/register` sign up
- `/verify-email` email verification
- `/dashboard` dashboard overview
- `/businesses` business profiles
- `/campaigns` campaigns list
- `/campaigns/new` create campaign
- `/campaigns/[id]` campaign detail
- `/manual-queue` manual operator queue
- `/analytics` analytics overview

### Backend

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/businesses`
- `POST /api/v1/businesses`
- `GET /api/v1/campaigns`
- `POST /api/v1/campaigns`
- `GET /api/v1/campaigns/{id}/details`
- `GET /api/v1/submissions/manual-queue`

## Running tests

```bash
cd backend
pytest tests -q
```

```bash
cd frontend
npx tsc --noEmit
```

## Deployment

- Backend can run with `python run.py` locally or `gunicorn` in production.
- Frontend can run with `npm run build` and `npm start`.
- See [ARCHITECTURE.md](/e:/citation-database-collector/seo-citation-saas/ARCHITECTURE.md) and [DEPLOYMENT.md](/e:/citation-database-collector/seo-citation-saas/DEPLOYMENT.md) for full deployment guidance.
