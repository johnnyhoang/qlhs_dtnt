# Authentication & Authorization Specification

## 1. Overview
Hệ thống sử dụng cơ chế xác thực dựa trên Session/Cookie và phân quyền dựa trên Role (RBAC) kết hợp với Module Access Control.
Gần đây, hệ thống đã bổ sung role **Teacher (Giáo viên)** với yêu cầu đặc thù về kiểm soát truy cập theo lớp (Class-Based Access Control).

## 2. Roles & Permissions

### Các Role trong hệ thống
1.  **ADMIN**:
    *   Quyền hạn cao nhất.
    *   Truy cập toàn bộ modules.
    *   Quản lý Users, Roles, System Settings.
2.  **USER (Cán bộ quản lý/Nhân viên)**:
    *   Truy cập các modules được cấp quyền (Selectable Modules).
    *   Thường nhìn thấy toàn bộ dữ liệu của module đó (không giới hạn lớp).
3.  **TEACHER (Giáo viên nhiệm vụ)**:
    *   Truy cập các modules được cấp quyền.
    *   **QUAN TRỌNG**: Chỉ được phép truy cập/tác động dữ liệu thuộc các lớp được phân công (`lop_phu_trach`).
    *   Không được phép xem hoặc sửa dữ liệu của lớp khác.

## 3. Class-Based Access Control (Teacher Role)

Đây là quy tắc cốt lõi áp dụng cho role `TEACHER`.

### Nguyên tắc
*   **Backend Enforcement**: Tuân thủ nguyên tắc "Server-side trust". Mọi API trả về danh sách hoặc thực hiện hành động ghi (create/update/delete) đều phải kiểm tra `user.lop_phu_trach`.
*   **Filtering**:
    *   *Read*: Query database phải luôn kèm điều kiện `WHERE lop IN (:...assignedClasses)` hoặc join bảng `hoc_sinh` để lọc.
    *   *Write*: Trước khi save/delete, phải query entity để kiểm tra xem entity đó có thuộc lớp mà giáo viên quản lý hay không.
*   **Modules áp dụng**:
    *   **HocSinh (Student)**: Quản lý hồ sơ học sinh.
    *   **SuatAn (Meal)**: Báo cắt cơm, thống kê suất ăn.
    *   **DinhMucXe (Vehicle)**: Đăng ký hỗ trợ chi phí tàu xe.
    *   **BaoHiem (Insurance)**: Quản lý BHYT.
    *   **ThanhToan (Payment)**: Xem thông tin thanh toán (nếu có).
    *   **ThongKe (Statistics)**: Xem báo cáo tổng hợp.

### Reference Implementation (Meal Module)
Module `SuatAn` là module chuẩn mực cho logic này.
*   *Service*: `SuatAnService.layTrangThaiHangNgay` nhận `user` context.
*   *Query*: Kiểm tra `if (user.role === 'TEACHER')`. Nếu đúng, thêm filter `lop IN user.assignedClasses`.
*   *Controller*: `req.user` được truyền từ middleware vào service.

## 4. Backend Implementation Details

### Data Model Entites
*   **NguoiDung (User)**:
    *   `vai_tro`: Enum ('ADMIN', 'USER', 'TEACHER').
    *   `lop_phu_trach`: Array string (JSON/Simple array) lưu danh sách tên lớp (Vd: `['10A1', '10A2']`).
*   **PhanQuyen**:
    *   Lưu quyền truy cập module cụ thể cho từng user.

### API & Service Layer Rules
Mọi Service method liên quan đến dữ liệu học sinh/lớp học phải có signature dạng:
```typescript
methodName(..., user?: any)
```
Logic xử lý:
```typescript
if (user && user.vai_tro === "TEACHER") {
    const assignedClasses = user.lop_phu_trach || [];
    if (assignedClasses.length === 0) return []; // Hoặc throw error tùy context
    
    // READ Operation
    queryBuilder.andWhere("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });

    // WRITE Operation
    if (data.lop && !assignedClasses.includes(data.lop)) {
        throw new Error("Access Denied: Class not assigned.");
    }
}
```

### Import Data (CSV)
Các API nhập liệu (`NhapLieuController`) **BẮT BUỘC** phải check quyền từng dòng dữ liệu:
*   Đọc dòng CSV -> Lấy mã học sinh -> Tìm học sinh trong DB -> Check lớp của học sinh đó có trong `user.lop_phu_trach` không.
*   Nếu không thỏa mãn -> Bỏ qua hoặc báo lỗi dòng đó.

## 5. Frontend Specifications

### Role Management UI (`Users.tsx`)
*   Khi tạo/sửa User:
    *   Dropdown chọn Role.
    *   Nếu Role = `TEACHER` -> Hiển thị thêm selector "Lớp phụ trách" (Multiple Select).
    *   Lưu `lop_phu_trach` xuống backend.

### Teacher UI Behavior
*   **Dashboard**: Thống kê chỉ hiển thị số liệu của các lớp được giao.
*   **List Views (Student, Meal, etc.)**: Dropdown chọn lớp "Lọc theo lớp" chỉ hiển thị các lớp trong `lop_phu_trach`.
*   **Forms**: Khi thêm mới học sinh (nếu được phép), chỉ được chọn lớp trong danh sách quản lý.

## 6. Error Handling
*   **403 Forbidden**: Trả về khi Teacher cố tình gọi API ID của học sinh/lớp không thuộc quyền quản lý.
*   **Empty Data**: Với các API danh sách, trả về mảng rỗng [] thay vì lỗi nếu Teacher không có lớp nào hoặc filter ra ngoài phạm vi.

## 7. Development Context (Token Saving)
*   **Không cần implement lại**: Auth Middleware, User Entity cơ bản.
*   **Cần chú ý**: Khi thêm module mới có field `lop` hoặc quan hệ với `HocSinh`, **phải** copy logic check `assignedClasses` từ `HocSinhService` hoặc `SuatAnService`.
