# Project Full Requirement Specification

## System Overview
- Frontend: React, Vite, Ant Design
- Backend: Node.js, Express, TypeORM
- Database: PostgreSQL on Supabase
- Authentication: Google OAuth login + JWT session token

## Deployment
- Web and server are deployed separately
- Supported platforms:
  - Google Cloud Run
  - Vercel

## Production Environment Variables

### Server
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CORS_ORIGINS`
- `ALLOW_VERCEL_PREVIEWS`

### Web
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Authentication Requirements
- Frontend and backend must use the same Google OAuth Web Client ID
- Every deployed frontend origin must be added to Google Cloud Console as an authorized JavaScript origin
- API CORS must allow the frontend origins that host the web app

## Database Requirements
- The app uses PostgreSQL only
- No MySQL, MSSQL, socket-path, or Cloud SQL-specific configuration is required
