# Student Management System (QLHS)

## Prerequisites
- Node.js (v16+)
- MySQL (v8.0)
- Docker (Optional, for easy DB setup)

## Setup

### 1. Database
Start MySQL using Docker Compose:
```bash
docker-compose up -d mysql
```
Or ensure you have a local MySQL running and update `server/.env` (modify `src/config.ts` if needed).

### 2. Backend (Server)
```bash
cd server
npm install
npm run dev
```
Server runs on port 3000.
API: `http://localhost:3000/api`

### 3. Frontend (Web)
```bash
cd web
npm install
npm run dev
```
Web runs on `http://localhost:5173`

## Credentials
- **Admin**: `admin` / `adminpassword`
- **User**: `user` / `userpassword`

## Project Structure
- `server`: Node.js + Express + TypeORM + MySQL
- `web`: React + Vite + Ant Design
