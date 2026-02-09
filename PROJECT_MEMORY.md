# Project Memory (QLHS-DTNT)

This document serves as the central source of truth for the **Hệ thống Quản lý học sinh DTNT** project. It captures the project's architecture, tech stack, core decisions, assumptions, and history to ensure context is preserved throughout development.

---

## 🚀 Project Overview

**Objective**: A comprehensive management system for students in ethnic minority boarding schools (DTNT), including demographics, healthcare (insurance), nutritionist (meal tracking), finance (payments), and logistics (transport support).

---

## 🛠 Tech Stack

### Backend
- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL (v8.0)
- **Authentication**: JWT-based with role-based access control (RBAC: ADMIN, USER)
- **Infrastructure**: Docker Compose (Local), Google Cloud Run (Production)

### Frontend
- **Framework**: React.js with Vite
- **Language**: TypeScript
- **UI Library**: Ant Design (v5)
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router DOM

---

## 🏛 Architecture

The project follows a **Monorepo** structure:
- `/server`: RESTful API backend.
- `/web`: Single Page Application (SPA) frontend.
- `/artifacts`: Project documentation and walkthroughs (system-managed).

### Core Design Patterns
1.  **Service-Controller-Route**: Traditional 3-layer architecture in the backend for clean separation of concerns.
2.  **Flexible Master Data**: A unified `DanhMucMaster` entity to handle various reference data categories (Ethnicities, Religions, Banks, Wards, etc.) without creating separate tables for each.
3.  **Audit Trail**: Standardized audit fields (`createdAt`, `updatedAt`, `nguoi_cap_nhat_id`) across major entities.

---

## 📦 Module Inventory

### 1. Student Management (`hoc_sinh`)
- **Focus**: Core student profiles.
- **Recent Expansion**: Added 10 optional fields including detailed addresses, banking info, and personal demographics (ethnicities, religions).
- **Features**: CRUD, CSV Import.

### 2. Meal Tracking (`suat_an`)
- **Focus**: Daily meal cut-off reporting (Breakfast, Lunch, Dinner).
- **Logic**: Students are assigned 3 meals/day. Staff can "report cut" (`bao_cat`) to exclude them from the count.

### 3. Health Insurance (`bao_hiem`)
- **Focus**: Tracking health insurance card numbers and validity.

### 4. Transport Support (`dinh_muc_xe`)
- **Focus**: Distance-based financial support for students.
- **Logic**: Calculated based on the distance from home to school. Current temp logic: `distance * 1000 VNĐ`.

### 5. Payment Management (`thanh_toan`)
- **Focus**: Batch payment processing by month/year.
- **Logic**: Aggregates meal costs (subtracting cut-offs) and transport support into a single payment record.

### 6. Master Data (`danh_muc_master`)
- **Focus**: Centralized reference data management.
- **Categories**: Health facilities, Wards, Provinces, Banks, Ethnicities, Religions.
- **Reference Data**: Vietnam administrative data updated to 2025 standards (34 provincial units) as per Decision 19/2025/QĐ-TTg.
- **Source**: `provinces.open-api.vn` and archival data for Decision 19/2025/QĐ-TTg.

### 7. Dashboard & Reporting (`thong_ke`)
- **Focus**: High-level visibility and dense reports.
- **New Feature**: Added weekly grid reports and monthly statistics.

---

## 🧠 Key Decisions & Assumptions

- **Master Data Flexibility**: We chose a single table with a `loai_danh_muc` discriminator instead of 6+ small tables. This simplifies CRUD logic and frontend components.
- **Meal Calculation**: We assume 3 meals/day are standard unless a cut-off is reported.
- **Transport Calculation**: Currently uses a simplified linear distance multiplier (`distance * 1000`). This is a placeholder and should be updated to a zone-based or tiered system later.
- **CSV Imports**: We use a flexible mapping utility to allow CSV files with slightly different headers to be imported based on keyword matching.

---

## 📈 Recent Progress History

### Feb 2026
- **Student Model Expansion**: Added address, banking, and demographic fields.
- **Master Data Module**: Implemented backend and frontend for centralized category management.
- **Dashboard Reports**: Created weekly meal cut-off grid and monthly statistics components.
- **Production Deployment**: Ongoing work to stabilize Cloud Run deployment via Cloud Build.

---

## 🔮 Next Steps & Roadmap
- [ ] Stabilize Cloud Run production environment.
- [ ] Integrate Master Data dropdowns into Student and Insurance forms.
- [ ] Implement hierarchical Master Data (Province > District > Ward).
- [ ] Enhance Transport Support logic with zone pricing (`DonGiaXe`).
- [ ] Add CSV export for all reports.
