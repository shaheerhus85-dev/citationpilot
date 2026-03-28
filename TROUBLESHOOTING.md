# Troubleshooting Guide

## Common Issues & Solutions

### Backend Issues

#### 1. "ModuleNotFoundError: No module named 'app'"

**Problem:** Python can't find the app module

**Solutions:**

```bash
# Make sure you're in backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt

# Try running from specific path
python -m app.main

# Set PYTHONPATH
export PYTHONPATH=$PYTHONPATH:$(pwd)
python run.py
```

#### 2. "Address already in use: ('0.0.0.0', 8000)"

**Problem:** Port 8000 is already being used

**Solutions:**

```bash
# Find process using port 8000
lsof -i :8000  # (Mac/Linux)
netstat -ano | findstr :8000  # (Windows)

# Kill the process
kill -9 <PID>  # (Mac/Linux)
taskkill /PID <PID> /F  # (Windows)

# Or use different port
python -m uvicorn app.main:app --port 8001
```

#### 3. "sqlalchemy.exc.OperationalError: unable to open database file"

**Problem:** SQLite database path issue

**Solutions:**

```bash
# Delete corrupted database
rm app.db

# Verify database file location in config.py
# Check DATABASE_URL = "sqlite:///./app.db"

# Restart server (it will recreate database)
python run.py
```

#### 4. Playwright not installing/finding browsers

**Problem:** Chromium browser not installed

**Solutions:**

```bash
# Install Playwright
pip install playwright

# Install browsers
python -m playwright install chromium

# Verify installation
python -m playwright install-deps

# If still failing, try:
python -m playwright install

# Check for system dependencies (Linux)
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libgconf-2-4
```

#### 5. JWT token errors

**Problem:** "Invalid token" or "Token expired"

**Solutions:**

```python
# In config.py, verify:
SECRET_KEY = "your-secret-key"  # Should be set
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Token format should be:
# Authorization: Bearer <your_token>

# Not:
# Authorization: <your_token>  # WRONG
# Bearer <your_token>  # WRONG
```

#### 6. CORS errors when calling from frontend

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solutions:**

```python
# In app/main.py, CORS is configured for:
allow_origins=["http://localhost:3000", "http://localhost:8000"]

# To add more origins:
allow_origins=[
    "http://localhost:3000",
    "http://localhost:8000",
    "https://yourdomain.com"
]

# For development, allow all:
allow_origins=["*"]  # NOT for production!
```

#### 7. Directory CSV not loading

**Problem:** "Directories CSV not found"

**Solutions:**

```python
# In config.py, check path:
DIRECTORIES_CSV_PATH = "../citation-database-system/directories_valid.csv"

# Verify file exists
ls ../citation-database-system/directories_valid.csv

# Update path if using different location
# Can use absolute path:
DIRECTORIES_CSV_PATH = "/absolute/path/to/directories_valid.csv"

# Or relative to script location:
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "data/directories.csv")
```

#### 8. Form detection not working

**Problem:** "Form fields not detected" or "Could not find submit button"

**Solutions:**

```python
# 1. Increase timeout in config.py
PLAYWRIGHT_TIMEOUT_MS = 60000  # 60 seconds instead of 30

# 2. Add custom field keywords
FIELD_NAME_KEYWORDS = {
    "company_name": ["company", "business", "name", "org_name"],
    # Add more variations...
}

# 3. Enable headless=False for debugging
PLAYWRIGHT_HEADLESS = False
# Then you can see what the browser is doing

# 4. Check form structure
# Some forms use:
# - <label>Company:</label><input>
# - <input placeholder="Company Name">
# - <input id="company_name">
# - <input name="company">
```

#### 9. Playwright timeout errors

**Problem:** "Timeout waiting for" or "Page did not load"

**Solutions:**

```python
# Increase timeout
PLAYWRIGHT_TIMEOUT_MS = 60000  # 60 seconds

# Some directories are slow:
# 1. Check website status: curl -I https://example-directory.com
# 2. Disable headless mode for debugging
# 3. Add wait conditions
# 4. Check Chrome DevTools network tab (if headless=False)
```

#### 10. Worker not processing submissions

**Problem:** Submissions stay in PENDING state

**Solutions:**

```bash
# 1. Check if worker thread is running
# In run.py, both threads should be started

# 2. Check worker logs
tail -f worker.log

# 3. Check database for queue items
sqlite3 app.db
SELECT * FROM submission_queue;

# 4. Verify Playwright is working
python -c "import playwright; print(playwright.__version__)"

# 5. Check for errors in database
SELECT * FROM directory_submissions
WHERE status = 'failed'
ORDER BY timestamp DESC LIMIT 5;
```

---

### Frontend Issues

#### 1. "Cannot find module" error

**Problem:** Next.js can't find modules

**Solutions:**

```bash
# Clear cache
rm -rf .next node_modules
npm install

# Verify import paths
# Use relative paths from file location
import Navbar from '@/components/Navbar'  # Good (@ = root)
import Navbar from '../components/Navbar'  # Good (relative)
import Navbar from 'components/Navbar'  # Bad

# Update tsconfig.json if needed
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 2. "Cannot GET /api/v1/auth/me"

**Problem:** API calls not reaching backend

**Solutions:**

```typescript
// Check .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

// Verify API is running
curl http://localhost:8000/health

// Check import in lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Verify in networks tab of browser DevTools
// Should show request going to http://localhost:8000/api/v1/...
```

#### 3. "undefined is not an object" after login

**Problem:** Token storage or auth state issue

**Solutions:**

```typescript
// Check localStorage
// In browser console:
localStorage.getItem("access_token");
localStorage.getItem("user");

// Clear and retry
localStorage.clear();
// Then login again

// Verify useAuthStore in lib/store.ts
// Should have loadFromStorage function:
useAuthStore.getState().loadFromStorage();
```

#### 4. API requests get 401 after a while

**Problem:** Token expired

**Solutions:**

```typescript
// Tokens expire in 30 minutes (configurable)
// To increase: in backend config.py
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour

// Or refresh token endpoint (not implemented yet)
// Can be added:
@router.post("/api/v1/auth/refresh")
async def refresh_token(current_user = Depends(...)):
    new_token, _ = create_access_token(...)
    return {"access_token": new_token}
```

#### 5. Real-time updates not working

**Problem:** Dashboard doesn't show updates

**Solutions:**

```typescript
// Check polling interval in submissions/[id]/page.tsx
const interval = setInterval(fetchProgress, 5000); // 5 seconds

// Verify API endpoint returns updated data
console.log("Progress:", progress); // Add debugging

// Clear browser cache
// Ctrl+Shift+Delete (Chrome) or Cmd+Shift+Delete (Mac)

// Check for network errors
// Network tab in DevTools
```

#### 6. Form submission fails silently

**Problem:** Create profile/campaign doesn't work

**Solutions:**

```typescript
// Add error logging
try {
  const response = await fetch(...)
  console.log('Response:', response)
  const data = await response.json()
  console.log('Data:', data)
} catch (err) {
  console.error('Error:', err)
}

// Verify form data is being sent
// Check Network tab in DevTools
// Look at Request body

// Check backend logs
cd backend
tail -f logs/api.log
```

#### 7. Styling issues (missing Tailwind CSS)

**Problem:** Components don't have styles

**Solutions:**

```bash
# Rebuild Tailwind
npm build

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm package-lock.json node_modules
npm install

# Verify tailwind.config.ts includes paths
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
]
```

#### 8. "hydration mismatch" error

**Problem:** Server-side and client-side rendering don't match

**Solutions:**

```typescript
// Use 'use client' directive in client components
"use client";

// Avoid dynamic content on first render
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;

// Use next/dynamic for non-SSR components
import dynamic from "next/dynamic";
const Component = dynamic(() => import("./Component"), { ssr: false });
```

#### 9. Logout not working properly

**Problem:** Still logged in after logout

**Solutions:**

```typescript
// In useAuthStore logout function:
logout: () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  set({ user: null, token: null, isAuthenticated: false });
};

// Then redirect:
await logout();
router.push("/login");
router.refresh(); // Refresh server components
```

#### 10. Port 3000 already in use

**Problem:** "Something is already running on port 3000"

**Solutions:**

```bash
# Find process on port 3000
lsof -i :3000  # (Mac/Linux)
netstat -ano | findstr :3000  # (Windows)

# Kill it
kill -9 <PID>  # (Mac/Linux)
taskkill /PID <PID> /F  # (Windows)

# Or use different port
npm run dev -- -p 3001
```

---

### Database Issues

#### 1. SQLite database corruption

**Problem:** Database locked or corrupted

**Solutions:**

```bash
# Backup current database
cp app.db app.db.backup

# Delete corrupted database
rm app.db

# Restart server to recreate
python run.py

# It will automatically create tables
```

#### 2. Database queries slow

**Problem:** Slow page loads or API responses

**Solutions:**

```python
# Enable query logging in config.py
DATABASE_URL = "sqlite:///./app.db?check_same_thread=False"

# Add indexes to frequently queried columns
# In models.py:
created_at = Column(DateTime, index=True)  # Add index=True
status = Column(Enum(SubmissionStatus), index=True)

# Use pagination
@router.get("/api/v1/submissions/requests")
async def list_requests(skip: int = 0, limit: int = 10):
    return db.query(...).offset(skip).limit(limit).all()
```

#### 3. Can't connect to database

**Problem:** "Database connection failed"

**Solutions:**

```python
# Verify database URL in config.py
DATABASE_URL = "sqlite:///./app.db"

# For absolute path:
DATABASE_URL = "sqlite:////absolute/path/to/app.db"

# For network databases (production):
DATABASE_URL = "postgresql://user:password@localhost/dbname"

# Test connection
python -c "from app.database import engine; engine.execute('SELECT 1')"
```

---

### Docker Issues

#### 1. "Docker command not found"

**Problem:** Docker not installed

**Solutions:**

```bash
# Install Docker
# Mac: brew install docker
# Windows: choco install docker-desktop
# Linux: curl -fsSL get.docker.com | sh
```

#### 2. Port binding fails with Docker

**Problem:** "Cannot start service backend: Bind for 0.0.0.0:8000"

**Solutions:**

```yaml
# In docker-compose.yml, change port mapping
# From: "8000:8000"
# To: "8001:8000" (different local port)
ports:
  - "8001:8000"
```

#### 3. Docker build fails

**Problem:** "Build failed" during docker build

**Solutions:**

```bash
# Clear Docker cache
docker system prune -a

# Build without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs backend

# Verify dependencies in requirements.txt
pip list > requirements.txt
```

---

### Deployment Issues

#### 1. Website returns 502 Bad Gateway

**Problem:** Application crashed on server

**Solutions:**

```bash
# Check logs
docker logs <container_id>

# Verify environment variables
docker exec <container_id> env | grep -i secret

# Check resource usage
docker stats

# Increase timeout
gunicorn app.main:app --timeout 120
```

#### 2. Database grows too large

**Problem:** Storage issues

**Solutions:**

```bash
# Archive old submissions
DELETE FROM directory_submissions
WHERE timestamp < DATE_NOW() - INTERVAL 3 MONTH;

# Vacuum database (SQLite)
sqlite3 app.db "VACUUM;"

# Compress backup
tar -czf app.db.gz app.db

# Switch to PostgreSQL for production
```

#### 3. Memory usage too high

**Problem:** Server using too much RAM

**Solutions:**

```python
# Limit Playwright instances in config.py
MAX_CONCURRENT_BROWSERS = 3

# Close pages properly
async def cleanup(self):
    await page.close()
    await context.close()
    await browser.close()

# Use connection pooling (already done with SQLAlchemy)

# Monitor with docker stats
docker stats
```

---

## Performance Optimization

### Backend Performance

```python
# 1. Enable query caching
from functools import lru_cache
@lru_cache()
def get_settings():
    return Settings()

# 2. Use database indexes
status = Column(Enum(...), index=True)
created_at = Column(DateTime, index=True)

# 3. Batch operations
submissions = db.query(...).filter(...).all()
# Process in batches
for chunk in chunks(submissions, 100):
    process_chunk(chunk)

# 4. Connection pooling (automatic with SQLAlchemy)
pool_size=5
max_overflow=10

# 5. Enable gzip compression
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

### Frontend Performance

```typescript
// 1. Code splitting with dynamic imports
const Dashboard = dynamic(() => import('./dashboard'), { ssr: false })

// 2. Image optimization
import Image from 'next/image'

// 3. Lazy loading
const [submissions, setSubmissions] = useState([])
// Pagination or virtual scrolling for large lists

// 4. Memoization
const MemoizedComponent = React.memo(Component)

// 5. Reduce re-renders
useCallback for event handlers
useMemo for expensive computations
```

---

## Debugging Tips

### Enable Debug Logging

```python
# In config.py
DEBUG = True

# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)

# View logs
tail -f server.log

# Filter by module
grep -i "automation" server.log
```

### Use Browser DevTools

```
F12 - Open DevTools
Network tab - See API calls
Console - JavaScript errors
Application - Storage/Cookies
```

### Check API Responses

```bash
# Test endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/auth/me | jq

# Pretty print JSON
curl ... | python -m json.tool
```

---

## Emergency Procedures

### Site Down

```bash
# 1. Check if server is running
sudo systemctl status app

# 2. Restart server
sudo systemctl restart app

# 3. Check logs for errors
journalctl -u app -n 100

# 4. Free up resources
free -h
df -h

# 5. Restart Docker
docker-compose restart
```

### Database Corrupted

```bash
# 1. Backup current database
cp app.db app.db.corrupt

# 2. Restore from backup
cp app.db.backup app.db

# 3. If no backup, reset
rm app.db
# Restart application to recreate empty DB
# (All data will be lost)
```

### High CPU Usage

```bash
# 1. Find process
top -p $(pgrep -f "python run.py")

# 2. Profile code
python -m cProfile -s cumulative run.py > profile.txt

# 3. Check for infinite loops
grep -n "while True" *.py

# 4. Limit worker threads
MAX_WORKERS = 2
```

---

## Testing Your Setup

```bash
# 1. Test backend
curl http://localhost:8000/health

# 2. Test database
sqlite3 app.db "SELECT COUNT(*) FROM users;"

# 3. Test frontend
curl http://localhost:3000

# 4. Test API endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 5. Test forms
# Open http://localhost:3000/register and create account
```

---

If you encounter issues not listed here, check:

1. Error message carefully - Google it
2. Project logs - Most info is there
3. GitHub issues - Others may have same problem
4. Documentation - Check README and ARCHITECTURE.md
5. Code - Read the error traceback

Still stuck? Add debugging:

```python
print(variable)  # Backend
console.log(variable)  # Frontend
```

Good luck! 🚀
