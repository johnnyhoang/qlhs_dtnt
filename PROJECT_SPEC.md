# Project Specification: QLHS-DTNT (Ethnic Boarding School Student Management)

This document serves as the complete technical specification, knowledge base, and reference for the QLHS-DTNT project.

---

## 1. Project Overview
- **Project Name**: Quản lý học sinh DTNT (Ethnic Boarding School Student Management)
- **Purpose & Business Goals**: Digitalize the management of student records, policies (meal cut-offs, scholarships), and boarding activities for Ethnic Minority Boarding Schools.
- **Target Users**: System Administrators (ADMIN), Staff/Office Workers (USER), and Class Teachers (TEACHER).
- **Main Problems it Solves**: Manual record-keeping, inefficient meal tracking, complex policy calculations (transport/insurance), and data silos.
- **High-level Workflow**:
    1.  Admin/Staff import student data from CSV or manually create profiles.
    2.  Teachers report daily meal cut-offs for their assigned classes.
    3.  System calculates transport support and insurance validity based on profile data.
    4.  Monthly reports are generated for payments and statistics.

## 2. Tech Stack
### Backend
- **Language**: TypeScript
- **Framework**: Node.js with Express.js
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT-based (Session/Cookie) with RBAC.
- **Libraries**: `zod` (validation), `multer` (file uploads), `csv-parse`, `google-auth-library`.

### Frontend
- **Framework**: React with Vite
- **UI Library**: Ant Design (v5)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM (v7)
- **Build Tool**: Vite

### DevOps
- **Docker**: Used for local development (MySQL) and containerizing services.
- **CI/CD**: Google Cloud Build via `cloudbuild.yaml` and `cloudbuild-web.yaml`.
- **Cloud Provider**: Google Cloud Platform (GCP).
    - **Compute**: Cloud Run (Managed).
    - **Database**: Cloud SQL (MySQL).
- **Monitoring / Logging**: Standard GCP Cloud Logging.

## 3. System Architecture
- **High-level Architecture**: Monorepo with two main services: `server` (REST API) and `web` (Single Page Application).
- **Request Flow**: Frontend (React) -> Load Balancer (Cloud Run) -> Backend (Express) -> Cloud SQL.
- **Authentication Flow**:
    1.  User enters credentials or uses Google OAuth.
    2.  Backend verifies and issues a JWT stored in local storage/cookies.
    3.  Frontend injects `Bearer` token into Axios requests via a central client.
- **Deployment Architecture (GCP)**:
    - `qlhs-server`: Cloud Run service exposed via public URL.
    - `qlhs-web`: Cloud Run service serving the Nginx-containerized static build.
    - `qlhs-db-instance`: Cloud SQL instance connected via Unix Socket in production.
- **Diagram Description**:
    - [User Browser] --(HTTPS)--> [Cloud Run (Web)]
    - [Cloud Run (Web)] --(API Calls)--> [Cloud Run (Server)]
    - [Cloud Run (Server)] --(Unix Socket)--> [Cloud SQL (MySQL)]
    - [Cloud Build] --(Deploys To)--> [Cloud Run Services]

## 4. Folder Structure Explanation
- **`/server`**: Backend API.
    - **`/src/entities`**: TypeORM models (HocSinh, NguoiDung, etc.).
    - **`/src/controllers`**: Request handling logic.
    - **`/src/services`**: Core business logic and database queries.
    - **`/src/routes`**: API endpoint definitions.
- **`/web`**: Frontend SPA.
    - **`/src/pages`**: Main view components (Students, Meals, Dashboard).
    - **`/src/components`**: Reusable UI elements.
    - **`/src/api`**: Axios service layers for backend interaction.
- **`/artifacts`**: System-generated documentation and walkthroughs.

## 5. Main Modules
### Student Management (`hoc_sinh`)
- **Responsibility**: Lifecycle management of student profiles.
- **Key APIs**: `GET /api/hoc-sinh`, `POST /api/hoc-sinh`, `POST /api/nhap-lieu/hoc-sinh`.
- **Related Tables**: `hoc_sinh`, `nguoi_dung` (audit).
- **Business Rules**: Unique Student ID, RBAC mandatory for teacher-class filtering.

### Meal Tracking (`suat_an`)
- **Responsibility**: Daily reporting of meal cut-offs (Breakfast, Lunch, Dinner).
- **Key APIs**: `GET /api/suat-an/trang-thai-hang-ngay`, `POST /api/suat-an/bao-cat`.
- **Related Tables**: `suat_an`, `hoc_sinh`.
- **Business Rules**: Default 3 meals/day; teachers can only report for their classes.

### Transport Support (`dinh_muc_xe`)
- **Responsibility**: Calculate and track distance-based financial support.
- **Key APIs**: `GET /api/dinh-muc-xe`, `PUT /api/dinh-muc-xe/:id`.
- **Related Tables**: `dinh_muc_xe`, `don_gia_xe`.
- **Business Rules**: Support = Distance * Unit Price (Temp: 1000VND/km).

### Master Data (`danh_muc_master`)
- **Responsibility**: Centralized management of reference lists (Ethnicities, Wards, etc.).
- **Key APIs**: `GET /api/danh-muc-master`, `POST /api/danh-muc-master`.
- **Related Tables**: `danh_muc_master`.

## 6. Features List
- **Bulk Import (CSV)**: Import students and related records with intelligent header mapping.
- **RBAC & Class Filtering**: Automatic data scoping for Teachers based on assigned classes.
- **Dashboard Summary**: Real-time stats on meal cut-offs and student totals.
- **Google OAuth**: Integrated login flow for school staff.
- **Payment Processing**: Monthly aggregation of meal costs and transport support.

## 7. Database Design
- **Entities**:
    - `HocSinh`: Fields: `ma_hoc_sinh`, `ho_ten`, `lop`, `dia_chi`, `ngay_sinh`, etc.
    - `NguoiDung`: Fields: `email`, `ho_ten`, `vai_tro`, `lop_phu_trach` (JSON string array).
    - `PhanQuyen`: Fields: `nguoi_dung_id`, `ma_module`, `co_quyen_xem`, `co_quyen_sua`.
    - `SuatAn`: Fields: `hoc_sinh_id`, `ngay`, `loai_suat_an`, `bao_cat`.
    - `DinhMucXe`: Fields: `hoc_sinh_id`, `khoang_cach`, `so_tien`.
    - `BaoHiem`: Fields: `hoc_sinh_id`, `so_the`, `han_su_dung`.
- **Relationships**: Most entities have a `ManyToOne` relationship with `HocSinh` (using `hoc_sinh_id` as UUID). `NguoiDung` has many `PhanQuyen`.

## 8. API Specification (Major Endpoints)
- **Auth**:
    - `POST /api/auth/login`: Email/Password login.
    - `POST /api/auth/google`: Google ID Token verification.
- **HocSinh**:
    - `GET /api/hoc-sinh`: List with filters (`classes[]`, `search`).
    - `POST /api/hoc-sinh`: Create profile.
- **SuatAn**:
    - `GET /api/suat-an/trang-thai-hang-ngay`: Get meal status for a specific date and class list.
    - `POST /api/suat-an/bao-cat`: Report cut-off for multiple students.

## 9. Business Rules & Validation Rules
- **Teacher Scope**: Teachers **MUST** have `lop_phu_trach` assigned. If empty, they see no data.
- **CSV Import**: Rows with classes not in `lop_phu_trach` (for Teachers) must be rejected.
- **Meal Lock**: (Implicit) Daily reports should ideally happen within the same day.

## 10. Configuration & Environment Variables
- `PORT`: Server port (Default 8080).
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Database credentials.
- `DB_SOCKET_PATH`: Unix socket for Cloud SQL connection.
- `JWT_SECRET`: Secret key for JWT signing.
- `GOOGLE_CLIENT_ID`: OAuth client ID.
- `VITE_API_URL`: Frontend build-time variable pointing to backend API.

## 11. Deployment Guide (Google Cloud)
1.  **Build Services**: Use `gcloud builds submit --config cloudbuild.yaml .`
2.  **Environment Setup**:
    - Inject `_DB_PASS`, `_JWT_SECRET`, `_INSTANCE_CONNECTION_NAME` via Cloud Build substitutions.
3.  **Cloud Run Configuration**:
    - Both `server` and `web` listener on PORT 8080.
    - Server requires `--add-cloudsql-instances` to connect to DB.

## 12. Existing Documentation Summary
- **PROJECT_MEMORY.md**: Central source of truth for design decisions and roadmap.
- **PROJECT_FULL_REQUIREMENTS.md**: Detailed breakdown of roles, permissions, and module functions.
- **authentication_authorization_spec.md**: Deep dive into Teacher role enforcement and RBAC logic.
- **DEPLOYMENT_GUIDE.md**: Technical steps for GCP hosting.

## 13. Coding Conventions & Patterns
- **Naming**: `camelCase` for variables, `PascalCase` for Components/Entities, `snake_case` for database columns.
- **Patterns**:
    - Backend: Controller -> Service -> Entity.
    - Frontend: Page -> API Utility -> Axios Client.
- **Error Handling**: Standardized HTTP status codes; frontend displays AntD notifications.

## 14. Known Issues & Technical Debt
- **TypeORM Sync**: `synchronize: true` is active in `data-source.ts`, which should be disabled in strict production environments in favor of migrations.
- **Hardcoded Secrets**: Some development secrets are present in `config.ts` as fallbacks; these must be strictly overridden by env vars in production.
- **Teacher Assignment**: `lop_phu_trach` is a JSON string array; might benefit from a dedicated join table for complex queries.

## 15. Improvement & Refactoring Suggestions
- **Performance**: Implement caching for Master Data lists.
- **Architecture**: Move CSV parsing logic to a dedicated worker/microservice if files become very large.
- **UX**: Add more granular error messages for CSV import failures (row/column specific).

## 16. AI Continuation Instructions
- **Refactoring**: Always check `authentication_authorization_spec.md` before changing any Permission/Access logic.
- **New Features**: Ensure every new module follows the `Controller -> Service -> Entity` pattern and includes the `user` context for filtering.
- **Testing**: Maintain standard port 8080 for all services.
- **Safe Mode**: Never modify `AppDataSource.initialize()` without ensuring proper database socket handling.

## 17. Appendix
- **Master Data Categories**: `DANTOC`, `TONGIAO`, `TINH`, `HUYEN`, `XA`, `NGANHANG`.
- **Sample Admin Credentials**: `admin` / `adminpassword` (Internal Dev).
