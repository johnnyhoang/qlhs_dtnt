# Postman And Web Deploy

## Postman

Production API base URL:
- `https://qlhs-server-311534268252.asia-southeast1.run.app/api`

Typical headers:
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

Useful endpoints:
- `GET /`
- `POST /auth/google-login`
- `GET /hoc-sinh`

## Deploy Only Web

If backend is already deployed, you can deploy only the frontend with [cloudbuild-web.yaml](/d/hieu/qlhs_dtnt/cloudbuild-web.yaml).

Required build arguments:
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Example:

```bash
gcloud builds submit --config cloudbuild-web.yaml .
```
