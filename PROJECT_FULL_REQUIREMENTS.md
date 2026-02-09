# Project Full Requirement Specification

## 1. System Overview
**Project Name**: Quản lý học sinh DTNT (Ethnic Boarding School Student Management)

### Purpose
Xây dựng hệ thống quản lý toàn diện cho trường Phổ thông Dân tộc Nội trú (DTNT). Hệ thống tập trung vào việc số hóa quy trình quản lý hồ sơ học sinh, chế độ chính sách (cắt cơm, học bổng), và các hoạt động nội trú hàng ngày.

### Architecture
*   **Frontend**: React (Vite), Ant Design, React Query.
*   **Backend**: Node.js, Express.
*   **Database**: MySQL, TypeORM.
*   **Authentication**: Session-based auth, Role-Based Access Control (RBAC).

## 2. Roles & Permissions

### Role Definitions
*   **ADMIN**: Quản trị viên hệ thống. Có toàn quyền truy cập tất cả module và settings.
*   **USER**: Cán bộ quản lý/nhân viên văn phòng. Được cấp quyền truy cập theo từng module cụ thể (Module-based permission). Mặc định nhìn thấy toàn bộ dữ liệu của module được cấp.
*   **TEACHER**: Giáo viên chủ nhiệm/Giáo viên bộ môn.
    *   Được cấp quyền theo module.
    *   **Class-Based Access Control**: Bắt buộc phải gắn với danh sách lớp cụ thể (`lop_phu_trach`). Chỉ được xem/sửa dữ liệu thuộc các lớp này.

### Permission Model
1.  **Module Permission**: `co_quyen_xem`, `co_quyen_sua` (cho USER/TEACHER).
2.  **Data Scope Permission**:
    *   Admin/User: Global scope (toàn trường).
    *   Teacher: Class scope (lớp phụ trách).

## 3. Teacher Role & Class-Based Authorization
Đây là thay đổi quan trọng nhất gần đây để đảm bảo an toàn dữ liệu.

### Requirements
*   **Assignment**: Admin phải assign module VÀ danh sách lớp cho Teacher.
*   **Enforcement**: Backend **bắt buộc** filter dữ liệu ở tầng Service/Database Query. Không tin tưởng filter ở Frontend.
*   **Reference Implementation**: Module `SuatAn` (Meal) là module tham chiếu chuẩn cho logic này.

## 4. Module Functional Requirements

### 4.1. Quản lý Học sinh (Student Module)
*   **Chức năng**:
    *   Quản lý hồ sơ: Mã HS, Họ tên, Lớp, Ngày sinh, Dân tộc, BHYT, v.v.
    *   Nhập/Xuất dữ liệu từ CSV.
*   **Authorization Rule**:
    *   *Read*: Teacher chỉ thấy học sinh thuộc lớp mình quản lý.
    *   *Write (Create/Update)*: Teacher chỉ thêm/sửa học sinh vào lớp mình quản lý. Chặn việc chuyển học sinh sang lớp khác.
    *   *Delete*: Teacher chỉ xóa học sinh thuộc lớp mình.

### 4.2. Quản lý Suất ăn (Meal Module)
*   **Chức năng**:
    *   Báo cắt cơm hàng ngày (Sáng, Trưa, Tối).
    *   Lý do cắt cơm, ghi chú.
*   **Authorization Rule**:
    *   *Read*: Teacher chỉ thấy trạng thái báo ăn của lớp mình.
    *   *Write*: Teacher chỉ được báo cắt cơm cho học sinh lớp mình.

### 4.3. Quản lý Định mức xe (Vehicle Quota Module)
*   **Chức năng**:
    *   Khai báo khoảng cách từ nhà đến trường.
    *   Tính toán số tiền hỗ trợ tàu xe.
    *   Thông tin tài khoản ngân hàng nhận hỗ trợ.
*   **Authorization Rule**:
    *   *Read/Write*: Teacher chỉ truy cập dữ liệu định mức của học sinh lớp mình.

### 4.4. Quản lý Bảo hiểm (Insurance Module)
*   **Chức năng**:
    *   Theo dõi hạn sử dụng thẻ BHYT.
    *   Lưu trữ thông tin thẻ, nơi đăng ký KCB ban đầu.
*   **Authorization Rule**:
    *   *Read/Write*: Teacher chỉ truy cập dữ liệu bảo hiểm của học sinh lớp mình.

### 4.5. Thống kê & Báo cáo (Statistics Module)
*   **Chức năng**:
    *   Báo cáo cắt cơm (theo ngày, tuần, tháng).
    *   Báo cáo kinh phí hỗ trợ tàu xe.
*   **Authorization Rule**:
    *   Report*: Các số liệu tổng hợp (Tổng học sinh, Tổng tiền, Tổng suất cắt) phải được tính toán lại dựa trên danh sách lớp được phân quyền. Tránh hiển thị số liệu toàn trường cho Teacher.
    *   *Filtering*: Hỗ trợ lọc theo nhiều lớp (`classes[]`). Nếu không chọn lớp nào -> Hiển thị tất cả các lớp được phép truy cập.

## 5. Frontend Specification

### Authentication Flow
1.  Login Form -> Backend API (`/auth/login`).
2.  Success -> Nhận User Info (kèm Role, Permissions, Assigned Classes).
3.  Lưu Session/Cookie.
4.  Redirect về Dashboard.

### Role Management UI
*   Tại trang quản lý User:
    *   Thêm `MultiSelect` cho trường "Lớp phụ trách" khi role là `TEACHER`.
    *   Hiển thị danh sách lớp đã gán ở bảng danh sách User.

### Module Behavior
*   Các Dropdown chọn lớp (Class Filter) trên UI phải tự động filter chỉ hiển thị các lớp được phép.
*   **Statistics**: Dropdown chọn lớp cho phép chọn nhiều lớp (Multi-Select). Logic:
    *   Empty selection = All permitted classes.
    *   Specific selection = Intersection(Selected, Permitted).

## 6. Backend Specification

### API Rules
*   Mọi API liên quan đến dữ liệu học sinh đều phải inject `user` context vào Service layer.
*   **Pattern**:
    ```typescript
    // Controller
    const user = (req as any).user;
    service.method(..., user);
    
    // Service
    if (user.role === 'TEACHER') {
        let assignedClasses = user.lop_phu_trach || [];
        if (assignedClasses.length === 0) return [];
        
        // Handle input 'classes' param (intersection check)
        if (inputClasses && inputClasses.length > 0) {
            assignedClasses = assignedClasses.filter(c => inputClasses.includes(c));
        }
        
        queryBuilder.toQuery().where('hoc_sinh.lop IN (:...assignedClasses)', { assignedClasses });
    }
    ```

### Data Import (CSV)
*   API `NhapLieuController` phải validate từng dòng dữ liệu nhập vào:
    *   Check xem học sinh trong file CSV có thuộc lớp mà Teacher quản lý không.
    *   Nếu không -> Skip hoặc Error.

## 7. Data Model Changes

### Updated Schema
*   **NguoiDung**:
    *   `vai_tro`: ENUM ('ADMIN', 'USER', 'TEACHER').
    *   `lop_phu_trach`: LONGTEXT (hoặc JSON) lưu mảng tên lớp.
*   **PhanQuyen**:
    *   `nguoi_dung_id`: FK.
    *   `ma_module`: String.
    *   `co_quyen_xem`: Boolean.
    *   `co_quyen_sua`: Boolean.

## 8. Change History & Migration

### Phase 1: Initial Development
*   Xây dựng khung dự án (Monorepo).
*   Module cơ bản: Học sinh, Suất ăn.
*   Auth cơ bản (Admin/User).

### Phase 2: Feature Expansion
*   Thêm module Bảo hiểm, Định mức xe, Thanh toán.
*   Tính năng Import/Export CSV.

### Phase 3: Teacher Role & Security Hardening (Current)
*   **Add Teacher Role**: Nhu cầu phân quyền chi tiết cho GVCN.
*   **Class-Based Filtering**: Fix lỗ hổng bảo mật khi Teacher xem được toàn bộ dữ liệu.
*   **Secure Statistics**: Fix lỗi lộ thông tin tổng hợp toàn trường trong báo cáo.
*   **Secure Import**: Ngăn chặn User/Teacher import đè dữ liệu của lớp khác.

## 9. Conclusion
Tài liệu này tổng hợp toàn bộ requirements và technical specs của dự án tính đến thời điểm hiện tại. Mọi phát triển trong tương lai cần tuân thủ nghiêm ngặt quy tắc **"Server-side Class-Based Access Control"** đã được định nghĩa ở mục 3 và 6.
