# Project Memory (QLHS-DTNT)

## Current Stack
- Backend: Node.js, Express, TypeScript, TypeORM
- Frontend: React, Vite, TypeScript, Ant Design
- Database: PostgreSQL on Supabase
- Auth: Google OAuth + JWT
- Deploy: Cloud Run or Vercel

## Important Operational Decisions
- `DATABASE_URL` is the primary database configuration
- `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must point to the same Google OAuth Web Client
- API CORS is controlled by `CORS_ORIGINS`
- Vercel preview domains can be enabled with `ALLOW_VERCEL_PREVIEWS=true`

## Current Deployment Shape
- API and web app are deployed separately
- Cloud Run build pipeline is defined in [cloudbuild.yaml](/d/hieu/qlhs_dtnt/cloudbuild.yaml)
- Web-only deploy pipeline is defined in [cloudbuild-web.yaml](/d/hieu/qlhs_dtnt/cloudbuild-web.yaml)
