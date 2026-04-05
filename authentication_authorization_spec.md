# Authentication And Authorization Specification

## Authentication Model
- Frontend signs users in with Google OAuth
- Frontend sends the Google ID token to `POST /api/auth/google-login`
- Backend verifies the token using `GOOGLE_CLIENT_ID`
- Backend returns a JWT used for subsequent API requests

## Required Environment Variables
- Server: `GOOGLE_CLIENT_ID`, `JWT_SECRET`
- Web: `VITE_GOOGLE_CLIENT_ID`

`GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must refer to the same Google OAuth Web Client.

## Google OAuth Requirements

Add every frontend origin that serves the web app to Google Cloud Console `Authorized JavaScript origins`, including:
- `http://localhost:5173`
- Cloud Run frontend URL
- Vercel production URL
- Any custom frontend domain

## Authorization Model
- `ADMIN`: full system access
- `USER`: module-based access
- `TEACHER`: module-based access limited by assigned classes

## Teacher Class Scope Rules
- Backend must enforce class filtering
- Frontend filtering alone is not sufficient
- Teachers can only read or modify data tied to `lop_phu_trach`

## CORS Rules
- API origins are controlled by `CORS_ORIGINS`
- Vercel preview deployments can be allowed with `ALLOW_VERCEL_PREVIEWS=true`
