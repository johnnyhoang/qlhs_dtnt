# Deployment Guide

This project uses:
- PostgreSQL on Supabase
- Express API in `server`
- Vite web app in `web`
- Google OAuth with one shared Google Client ID for frontend and backend verification

## Required Environment Variables

### Server
- `NODE_ENV=production`
- `PORT=3500` for local development. On Vercel the platform injects its own runtime port.
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
- `https://qlhs-web.vercel.app`
- Any custom production domain you use

## Health Check

Backend health endpoint:
- `GET /api/health`

Expected healthy response:
```json
{
  "ok": true,
  "database": "ready",
  "environment": "production"
}
```

## Deploy to Vercel

### Server
- Root directory: `server`
- Config: [server/vercel.json](/d:/hieu/qlhs_dtnt/server/vercel.json)
- Runtime entry: `src/index.ts`
- Required env:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `CORS_ORIGINS`
  - `ALLOW_VERCEL_PREVIEWS=true` if preview deployments should call the API

### Web
- Root directory: `web`
- Config: [web/vercel.json](/d:/hieu/qlhs_dtnt/web/vercel.json)
- Build command: `npm run build`
- Output directory: `dist`
- Required env:
  - `VITE_API_URL`
  - `VITE_GOOGLE_CLIENT_ID`

## Production Checklist
- Deploy `server`
- Open `https://<server-domain>/api/health` and confirm `ok: true`
- Deploy `web` with `VITE_API_URL=https://<server-domain>/api`
- Add the web domain to Google `Authorized JavaScript origins`
- Ensure `CORS_ORIGINS` includes the deployed web domain
- Verify login on `/admin/login`
- Verify a public CMS page and a PDF page render correctly

## Local Development

Create:
- [server/.env.example](/d:/hieu/qlhs_dtnt/server/.env.example) -> `server/.env`
- [web/.env.example](/d:/hieu/qlhs_dtnt/web/.env.example) -> `web/.env`

Then run:

```bash
cd server && npm run dev
cd web && npm run dev
```
