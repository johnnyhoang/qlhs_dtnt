# Student Management System (QLHS-DTNT)

A comprehensive management system for ethnic minority boarding schools, covering students, meals, insurance, transport, and payments.

---

## 📖 Project Knowledge
For detailed project context, design decisions, tech stack, and roadmap, please refer to **[PROJECT_MEMORY.md](./PROJECT_MEMORY.md)**.

---

## 🛠 Tech Stack
- **Frontend**: React (Vite), TypeScript, Ant Design, React Query.
- **Backend**: Node.js, Express, TypeScript, TypeORM.
- **Database**: MySQL 8.0.
- **DevOps**: Docker, Google Cloud Run.

---

## 🏛 Architecture
- **Monorepo**: `/server` (API) and `/web` (SPA).
- **Service Layer**: Business logic isolated in backend services.
- **Unified Master Data**: Flexible categorization for reference lists.

---

## 🚀 Setup & Running

### 1. Database
Start MySQL using Docker Compose:
```bash
docker-compose up -d mysql
```
Ensure you have a local MySQL running and update `server/.env`.

### 2. Backend (Server)
```bash
cd server
npm install
npm run dev
```
Server runs on port 3500. API: `http://localhost:3500/api`

### 3. Frontend (Web)
```bash
cd web
npm install
npm run dev
```
Web runs on `http://localhost:5173`

---

## 🔐 Credentials
- **Admin**: `admin` / `adminpassword`
- **User**: `user` / `userpassword`
