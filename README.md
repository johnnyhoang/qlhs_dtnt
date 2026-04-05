# QLHS-DTNT CMS

CMS/public website for an ethnic minority boarding school, with two existing internal tools preserved under the admin shell:
- `Quan ly hoc sinh`
- `Chuyen doi so`

## Architecture
- `web`: React + Vite + TypeScript + Ant Design
- `server`: Express + TypeScript + TypeORM
- `database`: Supabase PostgreSQL
- `auth`: Google login for admin/editor
- `deploy`: Vercel for the web app and API runtime

## Product Model
- Public site does not require login.
- Public menus are dynamic and CMS-driven.
- Two fixed public top-level items route into the internal tools:
  - `/admin/hoc-sinh`
  - `/admin/cds/dashboard`
- Admin shell lives under `/admin`.
- Roles currently supported:
  - `ADMIN`
  - `EDITOR`
- Each CMS menu item maps to one page.
- Page content types currently supported:
  - `HTML`
  - `PDF`
- Upload limit: `2MB`
- Workflow:
  - create/update
  - save draft
  - publish
  - unpublish
  - delete

## Environment

### Server
Create `server/.env` from [server/.env.example](/d:/hieu/qlhs_dtnt/server/.env.example).

Required variables:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CORS_ORIGINS`
- `ALLOW_VERCEL_PREVIEWS`

### Web
Create `web/.env` from [web/.env.example](/d:/hieu/qlhs_dtnt/web/.env.example).

Required variables:
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Rules:
- `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must match.
- `VITE_API_URL` should point to the deployed API base, for example `https://<api-domain>/api`.

## Local Development

### Server
```bash
cd server
npm install
npm run dev
```

Default local API expected by the frontend in this workspace: `http://localhost:3500/api`

### Web
```bash
cd web
npm install
npm run dev
```

Default local web URL: `http://localhost:5173`

### Run both
```bash
npm install
npm run dev
```

## Production Check
- API health endpoint: `GET /api/health`
- Healthy response returns `ok: true` and `database: ready`
- On Vercel, deploy `server` and `web` as separate projects using [server/vercel.json](/d:/hieu/qlhs_dtnt/server/vercel.json) and [web/vercel.json](/d:/hieu/qlhs_dtnt/web/vercel.json)

## Testing
- Server unit/integration:
```bash
npm run test:server
```
- Web component/integration:
```bash
npm run test:web
```
- Playwright e2e:
```bash
npm run test:e2e
```
- Full regression:
```bash
npm run test:all
```

## Current CMS Coverage
Implemented and tested:
- public homepage rendering
- public dynamic menu rendering
- public HTML page rendering
- public PDF embedded viewer rendering
- admin CMS workspace
- create/update page
- draft/publish/unpublish/delete page
- menu creation/update/delete
- menu hierarchy and reorder safeguards
- admin/editor access to CMS
- redirect from fixed public tool menus to admin login when unauthenticated
