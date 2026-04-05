# Project Specification: QLHS-DTNT

## Overview
- Monorepo with `server` and `web`
- Student management system for ethnic minority boarding schools
- Main modules: students, meals, transport support, insurance, payments, master data, reporting

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL on Supabase
- Google token verification via `google-auth-library`
- JWT for authenticated API access

### Frontend
- React
- Vite
- TypeScript
- Ant Design
- TanStack Query
- React Router

### Deployment
- Google Cloud Run via [cloudbuild.yaml](/d/hieu/qlhs_dtnt/cloudbuild.yaml)
- Vercel via [server/vercel.json](/d/hieu/qlhs_dtnt/server/vercel.json) and [web/vercel.json](/d/hieu/qlhs_dtnt/web/vercel.json)

## Authentication
- Frontend uses Google OAuth with `VITE_GOOGLE_CLIENT_ID`
- Backend verifies the Google ID token with `GOOGLE_CLIENT_ID`
- Both values must be the same Google OAuth Web Client ID
- Current auth endpoint: `POST /api/auth/google-login`

## Environment Variables

### Server
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CORS_ORIGINS`
- `ALLOW_VERCEL_PREVIEWS`
- Optional local fallback:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `DB_SSL`

### Web
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Deployment Rules
- Database is PostgreSQL only
- `DATABASE_URL` is the preferred database configuration
- API CORS must allow every frontend origin that can call it
- Google Cloud Console must allow every frontend origin in `Authorized JavaScript origins`

## Current Infrastructure Assumptions
- Supabase is the production database
- Cloud Run or Vercel can host the app
- No MySQL, Cloud SQL socket path, or `INSTANCE_CONNECTION_NAME` is used
