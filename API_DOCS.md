# API Documentation & Examples

## Authentication Endpoints

### Register User

Create a new user account.

**Request:**

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### Login User

Authenticate and get JWT token.

**Request:**

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### Get Current User

Retrieve authenticated user information.

**Request:**

```bash
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-03-17T10:30:00"
}
```

## Business Profile Endpoints

### Create Business Profile

Create a new business profile for citation building.

**Request:**

```bash
POST /api/v1/profiles/
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_name": "Joe's Plumbing",
  "website": "https://joesplumbing.com",
  "email": "contact@joesplumbing.com",
  "phone": "(555) 123-4567",
  "description": "Professional plumbing services in the metro area",
  "category": "Plumbing",
  "country": "United States",
  "city": "Austin",
  "state": "TX"
}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 1,
  "business_name": "Joe's Plumbing",
  "website": "https://joesplumbing.com",
  "email": "contact@joesplumbing.com",
  "phone": "(555) 123-4567",
  "description": "Professional plumbing services in the metro area",
  "category": "Plumbing",
  "country": "United States",
  "city": "Austin",
  "state": "TX",
  "is_primary": false,
  "created_at": "2024-03-17T10:35:00",
  "updated_at": "2024-03-17T10:35:00"
}
```

### List Business Profiles

Get all business profiles for the authenticated user.

**Request:**

```bash
GET /api/v1/profiles/
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "business_name": "Joe's Plumbing",
    "website": "https://joesplumbing.com",
    "email": "contact@joesplumbing.com",
    "phone": "(555) 123-4567",
    "category": "Plumbing",
    "country": "United States",
    "city": "Austin",
    "state": "TX",
    "is_primary": false,
    "created_at": "2024-03-17T10:35:00",
    "updated_at": "2024-03-17T10:35:00"
  }
]
```

### Get Business Profile

Retrieve a specific business profile.

**Request:**

```bash
GET /api/v1/profiles/1
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": 1,
  "user_id": 1,
  "business_name": "Joe's Plumbing",
  ...
}
```

### Update Business Profile

Update an existing business profile.

**Request:**

```bash
PUT /api/v1/profiles/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_name": "Joe's Professional Plumbing",
  "phone": "(555) 987-6543"
}
```

**Response:**

```json
{
  "id": 1,
  "business_name": "Joe's Professional Plumbing",
  "phone": "(555) 987-6543",
  ...
}
```

### Delete Business Profile

Remove a business profile.

**Request:**

```bash
DELETE /api/v1/profiles/1
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Profile deleted successfully"
}
```

## Citation/Submission Endpoints

### Create Citation Request

Start a new citation submission campaign.

**Request:**

```bash
POST /api/v1/submissions/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_profile_id": 1,
  "requested_count": 100
}
```

**Parameters:**

- `business_profile_id`: ID of the business profile
- `requested_count`: 50, 100, or 200 citations

**Response:**

```json
{
  "id": 5,
  "user_id": 1,
  "business_profile_id": 1,
  "requested_count": 100,
  "created_at": "2024-03-17T10:40:00",
  "completed_at": null
}
```

### List Submission Requests

Get all citation requests for the user.

**Request:**

```bash
GET /api/v1/submissions/requests
Authorization: Bearer {token}
```

**Response:**

```json
[
  {
    "id": 5,
    "user_id": 1,
    "business_profile_id": 1,
    "requested_count": 100,
    "created_at": "2024-03-17T10:40:00",
    "completed_at": null
  },
  {
    "id": 4,
    "user_id": 1,
    "business_profile_id": 1,
    "requested_count": 50,
    "created_at": "2024-03-16T14:20:00",
    "completed_at": "2024-03-17T09:15:00"
  }
]
```

### Get Submission Progress

Track progress of a specific citation request.

**Request:**

```bash
GET /api/v1/submissions/requests/5
Authorization: Bearer {token}
```

**Response:**

```json
{
  "submission_request_id": 5,
  "total_requested": 100,
  "submitted": 35,
  "pending": 60,
  "failed": 5,
  "manual_required": 0,
  "completion_percentage": 35.0,
  "statuses": {
    "pending": 60,
    "submitted": 35,
    "failed": 5,
    "manual_required": 0,
    "completed": 0
  }
}
```

### Get Submission Details

Get detailed information about all submissions in a request.

**Request:**

```bash
GET /api/v1/submissions/request/5/details
Authorization: Bearer {token}
```

**Response:**

```json
{
  "total": 100,
  "submitted": 35,
  "pending": 60,
  "failed": 5,
  "manual_required": 0,
  "completion_percentage": 35.0,
  "submissions": [
    {
      "id": 1,
      "directory_id": 42,
      "status": "submitted",
      "error_message": null,
      "captcha_type": null,
      "submission_url": "https://example-directory.com/submit",
      "timestamp": "2024-03-17T10:42:00",
      "completed_at": "2024-03-17T10:43:00",
      "retry_count": 0
    },
    {
      "id": 2,
      "directory_id": 43,
      "status": "failed",
      "error_message": "Form not found",
      "captcha_type": null,
      "submission_url": "https://another-directory.com/submit",
      "timestamp": "2024-03-17T10:45:00",
      "completed_at": null,
      "retry_count": 1
    },
    {
      "id": 3,
      "directory_id": 44,
      "status": "manual_required",
      "error_message": null,
      "captcha_type": "recaptcha",
      "submission_url": "https://recaptcha-directory.com/submit",
      "timestamp": "2024-03-17T10:47:00",
      "completed_at": null,
      "retry_count": 0
    },
    {
      "id": 4,
      "directory_id": 45,
      "status": "pending",
      "error_message": null,
      "captcha_type": null,
      "submission_url": null,
      "timestamp": "2024-03-17T10:49:00",
      "completed_at": null,
      "retry_count": 0
    }
  ]
}
```

### Get Dashboard Statistics

Retrieve overall statistics for the user's account.

**Request:**

```bash
GET /api/v1/submissions/dashboard
Authorization: Bearer {token}
```

**Response:**

```json
{
  "total_citations_requested": 350,
  "total_citations_completed": 280,
  "total_citations_pending": 50,
  "total_citations_failed": 20,
  "manual_required": 5,
  "business_profiles_count": 3
}
```

### Sync Directories

Load directories from CSV file (admin use).

**Request:**

```bash
POST /api/v1/submissions/sync-directories
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Synced 45 new directories"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Requested count must be 50, 100, or 200"
}
```

### 401 Unauthorized

```json
{
  "detail": "Invalid authentication credentials"
}
```

### 404 Not Found

```json
{
  "detail": "Business profile not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

## cURL Examples

### Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Create Profile

```bash
curl -X POST http://localhost:8000/api/v1/profiles/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "My Business",
    "website": "https://mysite.com",
    "email": "contact@mysite.com",
    "phone": "(555) 123-4567",
    "category": "Restaurants",
    "country": "United States",
    "city": "New York",
    "state": "NY"
  }'
```

### Create Citation Request

```bash
curl -X POST http://localhost:8000/api/v1/submissions/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_profile_id": 1,
    "requested_count": 100
  }'
```

### Get Progress

```bash
curl -X GET http://localhost:8000/api/v1/submissions/requests/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Submission Status States

### PENDING

- Initial state after queue creation
- Waiting for worker to process

### SUBMITTED

- Successfully submitted to directory
- Form filled and submitted without captcha

### MANUAL_REQUIRED

- Captcha detected (reCAPTCHA, hCaptcha, or math)
- User needs to manually complete submission
- User should visit URL and complete form

### FAILED

- Submission encountered an error
- Form not found, field detection failed, network error
- Will retry automatically up to configured limit

### COMPLETED

- Marked complete by user after manual submission
- (Frontend functionality)

## Status Code Reference

| Code | Meaning          |
| ---- | ---------------- |
| 200  | Success          |
| 201  | Created          |
| 400  | Bad Request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not Found        |
| 422  | Validation Error |
| 500  | Server Error     |

## Rate Limiting

The automation engine enforces:

- **1 submission per 60 seconds** globally
- This prevents IP blocking and ensures deliverability

## Token Format

JWT tokens are valid for 30 minutes by default.

**Token structure:**

```
header.payload.signature
```

**Payload contains:**

- `user_id`: ID of authenticated user
- `email`: User's email address
- `exp`: Token expiration timestamp

## Pagination

Currently not implemented but can be added:

```
GET /api/v1/submissions/requests?skip=0&limit=10
```

## Batch Operations

Not currently implemented but planned:

```
POST /api/v1/profiles/batch
POST /api/v1/submissions/batch
```

## WebSocket Support

Not currently implemented but can be added for real-time updates:

```
WS /api/v1/submissions/5/live
```

## Webhooks

Not currently implemented but can be added for external integrations:

```
POST /api/v1/webhooks/submission-status
```
