# Testing Guide - End-to-End Flow

Complete guide for testing all functionality of the SEO Citation Builder SaaS platform on localhost.

---

## 🎯 Prerequisites

- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Both .env files configured
- ✅ All dependencies installed

---

## 📝 Test Checklist

### PHASE 1: Authentication ✅

#### Test 1.1: User Registration

1. **Navigate to signup page**
   - URL: http://localhost:3000/register
   - Expected: Clean form with input fields

2. **Fill registration form with valid data**

   ```
   Full Name: Test User
   Email: testuser@example.local
   Username: testuser123
   Password: Password123!
   ```

3. **Click "Create Account"**
   - Expected status: 200 OK
   - Expected behavior: Redirect to dashboard
   - Check localStorage: `access_token` and `user` should be stored

4. **Verify data in database**
   ```bash
   sqlite3 backend/app.db "SELECT * FROM users;"
   ```

#### Test 1.2: User Login

1. **Logout if logged in** (click Logout in navbar)
2. **Navigate to login page**
   - URL: http://localhost:3000/login
3. **Fill login form**
   ```
   Email: testuser@example.local
   Password: Password123!
   ```
4. **Click "Sign In"**
   - Expected: Redirect to dashboard
   - Check localStorage for tokens

#### Test 1.3: Invalid Credentials

1. **Try login with wrong password**
   - Email: testuser@example.local
   - Password: wrongpassword
   - Expected: Error toast notification "Invalid email or password"

2. **Try login with non-existent email**
   - Email: notexist@example.local
   - Password: anypassword
   - Expected: Error toast notification

---

### PHASE 2: Business Profile Management ✅

#### Test 2.1: Create Business Profile

1. **Navigate to Businesses page**
   - URL: http://localhost:3000/profiles
   - Expected: List page with "+ Add Business" button

2. **Click "+ Add Business"**
   - Form should appear with all fields

3. **Fill business profile form**

   ```
   Business Name: FusionKode Test Inc.
   Website: https://fusionkode-test-demo.com
   Email: contact@fusionkode-test.local
   Phone: +1 (555) 123-4567
   Description: A test business for citation verification
   Category: Technology
   Country: United States
   City: San Francisco
   ```

4. **Click "Create Profile"**
   - Expected: Toast success notification
   - Business should appear in the list

5. **Verify in database**
   ```bash
   sqlite3 backend/app.db "SELECT * FROM business_profiles;"
   ```

#### Test 2.2: View Business Profile

1. **Business should appear as a card on the profiles page**
   - Card should show business name, category, city/country
   - Should have "Create Campaign" button

#### Test 2.3: Update Business Profile

1. **Note**: Full update form not currently shown in UI (can be added)
   - API endpoint works: `PUT /api/v1/profiles/{id}`

---

### PHASE 3: Campaign Creation ✅

#### Test 3.1: Create Citation Campaign

1. **Navigate to Campaigns page**
   - URL: http://localhost:3000/submissions
   - Expected: Campaign list (empty if first time)

2. **Click "+ New Campaign"**
   - Expected: New campaign creation page

3. **Select Business**
   - Should see "FusionKode Test Inc." in the list
   - Click to select it

4. **Select Citation Package**
   - Options: 50, 100, 200 citations
   - Select: 100 citations (for testing)
   - Review should show in summary

5. **Click "Launch Campaign"**
   - Expected: Toast success "Campaign created successfully!"
   - Redirect to campaign details page
   - URL: http://localhost:3000/submissions/{id}

#### Test 3.2: Verify Campaign in Database

```bash
sqlite3 backend/app.db "SELECT * FROM submission_requests;"
sqlite3 backend/app.db "SELECT * FROM directory_submissions LIMIT 10;"
```

---

### PHASE 4: Campaign Progress Tracking ✅

#### Test 4.1: View Campaign Details

1. **On campaign details page** (auto-redirected after creation)
   - URL: http://localhost:3000/submissions/1

2. **Verify display of:**
   - Campaign ID (e.g., #1)
   - Progress bar showing completion %
   - Status card for: Total, Submitted, Pending, Failed, Manual
   - Table of individual directory submissions

3. **Check auto-refresh**
   - Wait 5+ seconds
   - Page should refresh automatically
   - Counters should update

#### Test 4.2: Monitor Submission Status Changes

1. **Initial state (right after creation)**
   - All submissions should be "PENDING"
   - Progress: 0%

2. **After 10-30 seconds**
   - Some submissions should move to "SUBMITTED" or "FAILED"
   - Progress percentage should increase
   - Page auto-refreshes every 5 seconds

3. **Check worker logs in backend terminal**
   - Should see: `Processing submission #X to domain.com`
   - Should see: `Submission #X status: submitted/failed`

---

### PHASE 5: Dashboard Statistics ✅

#### Test 5.1: Dashboard Main Page

1. **Navigate to Dashboard**
   - URL: http://localhost:3000/dashboard
   - Click logo or go to home after login

2. **Verify statistics displayed:**
   - Total Citations: Should show 100
   - Completed: Should show increasing number
   - Pending: Should show decreasing number
   - Failed: Should show any failed submissions
   - Manual Review: Manual captcha submissions count
   - Business Profiles: Should show 1

3. **Quick action cards visible:**
   - Business Profiles
   - Create Campaign
   - View Campaigns
   - Documentation

#### Test 5.2: Statistics Update in Real-Time

1. **Open dashboard in one browser tab**
2. **Open campaign details in another tab**
3. **Wait for campaign to progress**
4. **Switch back to dashboard**
5. **Numbers should have updated**

---

### PHASE 6: Navigation & UI ✅

#### Test 6.1: Navbar Navigation

1. **Verify navbar elements:**
   - Logo (clickable, goes to dashboard)
   - "Businesses" link
   - "Campaigns" link
   - User name display
   - Logout button

2. **Test navigation:**
   - Click "Businesses" → should go to /profiles
   - Click "Campaigns" → should go to /submissions
   - Click logo → should go to /dashboard

3. **Test logout:**
   - Click "Logout"
   - Should redirect to /login
   - localStorage should be cleared

#### Test 6.2: Page Layout

1. **All pages should have:**
   - Dark theme (slate-900 background)
   - Navbar at top
   - Content section
   - Proper spacing and padding

2. **Form inputs should have:**
   - Focus ring (blue outline)
   - Disabled state when submitting
   - Placeholder text

3. **Buttons should have:**
   - Hover effects
   - Disabled states
   - Loading states (text changes)

---

### PHASE 7: Error Handling ✅

#### Test 7.1: Toast Notifications

1. **Success toasts:**
   - Create account → "Account created successfully!"
   - Login → "Logged in successfully!"
   - Add business → "Profile created successfully!"
   - Create campaign → "Campaign created successfully!"

2. **Error toasts:**
   - Try to create campaign without selecting business → error message
   - Invalid login credentials → error message
   - Failed API request → error message

#### Test 7.2: API Error Handling

1. **Simulate backend offline:**
   - Stop backend server
   - Try to create campaign
   - Expected: Error toast + proper error message

2. **Resume backend:**
   - Restart backend
   - Page should recover and work again

---

### PHASE 8: Data Persistence ✅

#### Test 8.1: Session Persistence

1. **Create campaign as logged-in user**
2. **Refresh the page** (Ctrl+R)
3. **Expected:** Still logged in, data still there
4. **Check localStorage** in DevTools → Application tab
   - Should have `access_token` and `user` JSON

#### Test 8.2: Database Persistence

1. **Stop and restart both servers**
2. **Login again**
3. **Navigate to businesses and campaigns**
4. **All data should still be there**

---

## 🔧 Testing API Directly

### Using curl (Command Line)

#### Test User Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "username": "apitest",
    "password": "Password123!",
    "full_name": "API Test User"
  }'
```

#### Test User Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Password123!"
  }'
```

Response contains: `access_token`

#### Test Get User Profile (requires token)

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Create Business Profile

```bash
curl -X POST http://localhost:8000/api/v1/profiles/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "business_name": "API Business",
    "website": "https://api-test.com",
    "email": "api@test.com",
    "category": "Technology",
    "country": "United States"
  }'
```

#### Test Create Campaign

```bash
curl -X POST http://localhost:8000/api/v1/submissions/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "business_profile_id": 1,
    "requested_count": 50
  }'
```

#### Test Get Dashboard Stats

```bash
curl -X GET http://localhost:8000/api/v1/submissions/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💾 Database Inspection

### Using SQLite Command Line

```bash
cd backend
sqlite3 app.db

# List all tables
.tables

# View users
SELECT id, email, username, created_at FROM users;

# View business profiles
SELECT id, business_name, category, country FROM business_profiles;

# View submission requests
SELECT id, requested_count, created_at, completed_at FROM submission_requests;

# View submission status counts
SELECT status, COUNT(*) FROM directory_submissions GROUP BY status;

# Exit
.quit
```

---

## 📊 Performance & Load Testing

### Test 1: Multiple Campaigns

1. Create 3-5 different business profiles
2. Create campaigns for each one
3. Monitor dashboard - all should be updating
4. Check worker doesn't get stuck

### Test 2: Large Campaign

1. Create campaign with 200 citations
2. Monitor progress over time
3. Check for memory leaks
4. Check logs for errors

### Test 3: Concurrent Access

1. Open dashboard in Tab 1
2. Open campaign details in Tab 2
3. Open different campaign in Tab 3
4. Refresh all tabs simultaneously
5. All should load without issues

---

## ✅ Final Verification Checklist

- [ ] Frontend loads correctly at http://localhost:3000
- [ ] Backend API responds at http://localhost:8000
- [ ] API docs available at http://localhost:8000/docs
- [ ] User can register new account
- [ ] User can login with credentials
- [ ] Logout clears session
- [ ] Can create business profile
- [ ] Business profiles list displays
- [ ] Can create citation campaign
- [ ] Campaign shows correct citation count
- [ ] Campaign progress updates in real-time
- [ ] Dashboard shows correct statistics
- [ ] Navigation works between pages
- [ ] Responsive design on mobile
- [ ] Error messages display correctly
- [ ] Toast notifications work
- [ ] database persists data after restart
- [ ] Background worker processes submissions
- [ ] API endpoints respond with correct status codes

---

## 🚀 Success Criteria

The system is **FULLY WORKING** if:

1. ✅ You can complete the entire flow from signup to campaign status tracking
2. ✅ No console errors on frontend
3. ✅ No errors in backend logs (only INFO and WARNING OK)
4. ✅ All API requests return 200-201 status codes
5. ✅ Campaign progress updates every 5 seconds
6. ✅ Database queries return expected results
7. ✅ UI is clean, responsive, and theme is consistent

---

**Test Status**: Ready for testing  
**Last Updated**: March 17, 2026  
**Version**: 1.0.0
