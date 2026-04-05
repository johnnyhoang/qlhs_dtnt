# Cloud Build Fix

If Cloud Build is misconfigured, ensure the trigger points to:

```text
/cloudbuild.yaml
```

Do not configure the trigger as a Dockerfile build for the repo root.

## Required Cloud Build Substitutions
- `_DATABASE_URL`
- `_JWT_SECRET`
- `_GOOGLE_CLIENT_ID`
- `_VITE_API_URL`
- `_CORS_ORIGINS`
- `_ALLOW_VERCEL_PREVIEWS`

## Current Infrastructure Assumption
- Database is Supabase PostgreSQL
- No Cloud SQL connection name or socket configuration is needed
