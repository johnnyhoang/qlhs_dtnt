# Student Management System (QLHS-DTNT)

Student management system for ethnic minority boarding schools.

## Stack
- Frontend: React, Vite, TypeScript, Ant Design
- Backend: Node.js, Express, TypeScript, TypeORM
- Database: PostgreSQL on Supabase
- Deploy: Cloud Run or Vercel

## Local Setup

### Database
Use Supabase directly, or run local PostgreSQL:

```bash
docker-compose up -d postgres
```

### Server
Create `server/.env` from [server/.env.example](/d/hieu/qlhs_dtnt/server/.env.example), then run:

```bash
cd server
npm install
npm run dev
```

Current local env in this workspace uses `http://localhost:3500/api`.

### Web
Create `web/.env` from [web/.env.example](/d/hieu/qlhs_dtnt/web/.env.example), then run:

```bash
cd web
npm install
npm run dev
```

Web runs on `http://localhost:5173`.

## Key Rules
- Database config should use `DATABASE_URL`
- `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` must match
- API CORS is controlled by `CORS_ORIGINS`
