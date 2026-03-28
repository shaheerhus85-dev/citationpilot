# CitationPilot Deployment

## Local
Backend:
```powershell
cd backend
python run.py
```

Frontend:
```powershell
cd frontend
npm run dev
```

## Database Backup
```powershell
Copy-Item backend\\app.db backend\\app.db.bak
```

## Migration
```powershell
sqlite3 backend\\app.db ".read backend/migrations/001_add_manual_queue_tables.sql"
```

## Production
- Backend container: [Dockerfile.prod](/e:/citation-database-collector/seo-citation-saas/backend/Dockerfile.prod)
- Frontend: Vercel-compatible Next.js app
- Backend host: Railway/Fly.io style Python container deployment

## Health Checks
- `GET /health`
- `GET /api/v1/auth/me`
- `GET /api/v1/submissions/manual-queue`
