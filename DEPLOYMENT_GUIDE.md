# Deployment Guide

This project uses:
- PostgreSQL on Supabase
- Express API in `server`
- Vite web app in `web`
- Google OAuth with one shared Google Client ID for frontend and backend verification

## Required Environment Variables

### Server
- `NODE_ENV=production`
- `PORT=8080` on Cloud Run, or `3500` for local development
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `GOOGLE_CLIENT_ID=...`
- `CORS_ORIGINS=https://your-web-domain,https://your-preview-domain`
- `ALLOW_VERCEL_PREVIEWS=true|false`

### Web
- `VITE_API_URL=https://your-server-domain/api`
- `VITE_GOOGLE_CLIENT_ID=...`

## Google OAuth Requirements

The same Google OAuth Web Client ID must be configured in:
- `server` as `GOOGLE_CLIENT_ID`
- `web` as `VITE_GOOGLE_CLIENT_ID`

In Google Cloud Console, add every frontend origin that can open the login page to `Authorized JavaScript origins`, for example:
- `http://localhost:5173`
- `https://qlhs-web-311534268252.asia-southeast1.run.app`
- `https://qlhs-web.vercel.app`
- Any custom production domain you use

## Deploy to Cloud Run

Use [cloudbuild.yaml](/d/hieu/qlhs_dtnt/cloudbuild.yaml) to build and deploy both services.

Important substitutions:
- `_DATABASE_URL`
- `_JWT_SECRET`
- `_GOOGLE_CLIENT_ID`
- `_VITE_API_URL`
- `_CORS_ORIGINS`
- `_ALLOW_VERCEL_PREVIEWS`

Backend and frontend are deployed as separate Cloud Run services:
- `qlhs-server`
- `qlhs-web`

## Deploy to Vercel

### Server
- Root directory: `server`
- Build preset: Node.js / `@vercel/node`
- Required env:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `CORS_ORIGINS`
  - `ALLOW_VERCEL_PREVIEWS=true` if you want preview deployments to call the API

### Web
- Root directory: `web`
- Build command: `npm run build`
- Output directory: `dist`
- Required env:
  - `VITE_API_URL`
  - `VITE_GOOGLE_CLIENT_ID`

## Local Development

Create:
- [server/.env.example](/d/hieu/qlhs_dtnt/server/.env.example) -> `server/.env`
- [web/.env.example](/d/hieu/qlhs_dtnt/web/.env.example) -> `web/.env`

Then run:

```bash
cd server && npm run dev
cd web && npm run dev
```
