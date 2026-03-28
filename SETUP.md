# SEO Citation Builder SaaS - Local Setup Guide

Complete guide to setting up and running the SEO Citation Builder SaaS platform on your local machine.

---

## 🎯 Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **npm or yarn** (JavaScript package manager)
- **Git** (for version control)
- **Windows, macOS, or Linux**

---

## 📋 Project Structure

```
seo-citation-saas/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   ├── automation/         # Playwright automation engine
│   ├── run.py              # Server entry point
│   └── requirements.txt     # Python dependencies
│
└── frontend/               # Next.js React frontend
    ├── app/                # App router pages
    ├── components/         # React components
    ├── lib/                # Utilities and API client
    ├── package.json        # NPM dependencies
    └── next.config.js      # Next.js config
```

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Using Quick Start Script (Windows)

```powershell
# Run the provided quick-start script
.\quick-start.bat
```

This will:

1. Check Python and Node.js versions
2. Create Python virtual environment
3. Install dependencies
4. Start both servers automatically

### Option 2: Using Quick Start Script (macOS/Linux)

```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

## 🔧 Manual Setup (Detailed)

### Step 1: Backend Setup

#### 1.1 Navigate to backend directory

```bash
cd backend
```

#### 1.2 Create Python virtual environment

**Windows:**

```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

#### 1.3 Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs:

- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM database
- **Pydantic** - Data validation
- **python-jose** - JWT authentication
- **bcrypt** - Password hashing
- **Playwright** - Browser automation
- **python-dotenv** - Environment variable management

#### 1.4 Verify .env file

Make sure `.env` file exists in `backend/` directory with:

```env
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production-12345
DATABASE_URL=sqlite:///./app.db
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PLAYWRIGHT_HEADLESS=True
PLAYWRIGHT_TIMEOUT_MS=30000
SUBMISSION_INTERVAL_SECONDS=60
USE_TOR_PROXY=False
TOR_PROXY_URL=socks5://127.0.0.1:9050
DIRECTORIES_CSV_PATH=../citation-database-system/directories_valid.csv
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### 1.5 Install Playwright browsers

```bash
playwright install
```

#### 1.6 Start the backend server

```bash
python run.py
```

Expected output:

```
========================================
SEO Citation SaaS - Backend Server
========================================
2026-03-17 10:30:00,123 - app.main - INFO - Initializing database...
2026-03-17 10:30:00,456 - app.main - INFO - Database initialized
2026-03-17 10:30:00,789 - app.workers.submission_worker - INFO - Background worker thread started (daemon)
2026-03-17 10:30:01,012 - uvicorn.server - INFO - Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ Backend is running on: **http://localhost:8000**

- API Docs: **http://localhost:8000/docs**

---

### Step 2: Frontend Setup (In a new terminal)

#### 2.1 Navigate to frontend directory

```bash
cd frontend
```

#### 2.2 Install Node dependencies

```bash
npm install
# or
yarn install
```

#### 2.3 Verify .env.local file

Make sure `.env.local` exists in `frontend/` directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 2.4 Start the development server

```bash
npm run dev
# or
yarn dev
```

Expected output:

```
> seo-citation-saas@ dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

✅ Frontend is running on: **http://localhost:3000**

---

## 🧪 Testing the Complete Flow

### 1. Open the Application

Navigate to: **http://localhost:3000**

### 2. Create an Account

1. Click "Get Started" or go to `/register`
2. Fill in:
   - **Full Name**: John Doe
   - **Email**: john@example.com
   - **Username**: johndoe
   - **Password**: password123 (min 8 chars)
3. Click "Create Account"
4. You'll be redirected to the dashboard

### 3. Add a Business Profile

1. Click "Businesses" in the navigation
2. Click "+ Add Business"
3. Fill in the form:
   - **Business Name**: FusionKode Test Inc.
   - **Website**: https://fusionkode-test.com
   - **Email**: contact@fusionkode-test.local
   - **Phone**: +1-555-0123
   - **Category**: Technology
   - **Country**: United States
   - **City**: San Francisco
   - **Description**: A test business for citation verification
4. Click "Create Profile"

### 4. Create a Campaign

1. Click "Campaigns" in the navigation
2. Click "+ New Campaign"
3. Select your business from "Select Business" section
4. Choose citation package:
   - **50 Citations** (Starter)
   - **100 Citations** (Popular) - Recommended for testing
   - **200 Citations** (Enterprise)
5. Review the campaign summary
6. Click "Launch Campaign"

### 5. Monitor Campaign Progress

1. You'll be taken to the campaign details page
2. You can see:
   - **Overall Completion %** (progress bar)
   - **Total, Submitted, Pending, Failed, Manual** counts
   - **Detailed submission table** with status for each directory

3. The page auto-refreshes every 5 seconds

4. Statuses you'll see:
   - ✅ **Submitted** - Successfully submitted
   - ⏳ **Pending** - In process
   - ❌ **Failed** - Error during submission
   - 👤 **Manual** - Requires manual verification (captcha/puzzle)

### 6. Return to Dashboard

1. Click the logo or "Dashboard" in navigation
2. You'll see updated statistics:
   - Total citations requested
   - Completed citations
   - Pending citations
   - Failed citations
   - Businesses created

---

## 📊 Dashboard Overview

### Key Sections

1. **Citation Statistics**
   - Total citations requested across all campaigns
   - Submissions completed
   - Submissions pending
   - Failed submissions
   - Manual reviews needed
   - Business profiles count

2. **Quick Actions**
   - **Business Profiles** - Manage your businesses
   - **Create Campaign** - Start new citation campaign
   - **View Campaigns** - See all active campaigns
   - **Documentation** - Help and guides

---

## 🔑 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Business Profiles

- `POST /api/v1/profiles/` - Create profile
- `GET /api/v1/profiles/` - List profiles
- `GET /api/v1/profiles/{id}` - Get profile
- `PUT /api/v1/profiles/{id}` - Update profile
- `DELETE /api/v1/profiles/{id}` - Delete profile

### Submissions/Campaigns

- `POST /api/v1/submissions/request` - Create campaign
- `GET /api/v1/submissions/requests` - List campaigns
- `GET /api/v1/submissions/requests/{id}` - Get campaign progress
- `GET /api/v1/submissions/request/{id}/details` - Get detailed submissions
- `GET /api/v1/submissions/dashboard` - Get dashboard stats

### Utility

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - API documentation (ReDoc)

---

## 🐛 Troubleshooting

### Backend Issues

#### Port 8000 Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Issues

```bash
# Delete old database and recreate
rm app.db
# Restart the server - it will recreate the database
python run.py
```

#### Playwright Issues

```bash
# Reinstall Playwright and browsers
pip uninstall playwright
pip install playwright
playwright install
```

### Frontend Issues

#### Port 3000 Already in Use

```bash
# Kill the process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

#### Node Modules Issue

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### .env.local Not Working

```bash
# Verify .env.local exists in frontend folder
# Check NEXT_PUBLIC_API_URL is set
# Make sure frontend is restarted after .env.local changes
npm run dev
```

### CORS Errors

If you see CORS errors in the browser console:

1. Verify backend is running on http://localhost:8000
2. Verify frontend .env.local has: `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Restart both frontend and backend
4. Clear browser cache

### API Connection Issues

Test API connectivity:

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

curl http://localhost:8000/docs
# Should open API documentation
```

---

## 📦 Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to a random 32-character string
- [ ] Set `DEBUG=False`
- [ ] Use proper database (PostgreSQL recommended, not SQLite)
- [ ] Enable HTTPS/TLS
- [ ] Set up proper CORS allowed origins
- [ ] Use environment variables from secure vault
- [ ] Enable rate limiting
- [ ] Set up proper logging and monitoring
- [ ] Create database backups
- [ ] Test automated submission on staging first

### Deployment Options

1. **Docker** - Use provided `docker-compose.yml`:

   ```bash
   docker-compose up
   ```

2. **AWS/Heroku** - Deploy using their CLI tools

3. **VPS** - Deploy using systemd services and Nginx/Apache reverse proxy

---

## 🔍 Monitoring & Logs

### Backend Logs

Logs appear in the terminal where you ran `python run.py`:

```
2026-03-17 10:30:00,789 - app.workers.submission_worker - INFO - Submission worker started
2026-03-17 10:30:15,234 - app.workers.submission_worker - INFO - Processing submission #1 to example.com
2026-03-17 10:30:30,567 - app.workers.submission_worker - INFO - Submission #1 status: submitted
```

### Frontend Logs

Open browser DevTools (F12) and check:

- **Console** - JavaScript errors and API calls
- **Network** - API request/response
- **Application** - LocalStorage (access tokens, user data)

---

## 🎓 Learning Resources

### Architecture Overview

- Backend: FastAPI + SQLAlchemy ORM
- Frontend: Next.js 14 + React 18
- Authentication: JWT (JSON Web Tokens)
- Automation: Playwright browser automation

### File Structure Understanding

- **backend/app/main.py** - FastAPI app initialization
- **backend/app/api/** - API route definitions
- **backend/app/models/** - Database models
- **backend/app/services/** - Business logic
- **backend/migration_worker.py** - Background job processing

- **frontend/app/layout.tsx** - Root layout
- **frontend/app/dashboard/page.tsx** - Dashboard page
- **frontend/components/Navbar.tsx** - Navigation component
- **frontend/lib/store.ts** - Zustand state management
- **frontend/lib/api.ts** - API client setup

---

## 📞 Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Check backend logs: `python run.py` terminal output
3. Check frontend logs: Browser DevTools console
4. Check API docs: http://localhost:8000/docs

---

## 📝 Next Steps

1. ✅ Complete all 7 phases of the project
2. 🧪 Run end-to-end tests
3. 📚 Review API documentation at /docs
4. 🚀 Deploy to production
5. 📊 Monitor submissions and success rates
6. 🔄 Iterate based on feedback

---

**Last Updated**: March 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
