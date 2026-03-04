# Hướng dẫn Deploy Monorepo lên Google Cloud Run

Tài liệu này hướng dẫn bạn từng bước để thiết lập và deploy cả backend và frontend lên Google Cloud Platform (GCP).

## 1. Chuẩn bị (GCP Project)

1.  **Tạo Project**: Truy cập [GCP Console](https://console.cloud.google.com/) và tạo một project mới (ví dụ: `qlhs-dtnt`).
2.  **Bật Billing**: Đảm bảo project của bạn đã được liên kết với tài khoản thanh toán.
3.  **Cài đặt gcloud CLI**: (Tùy chọn) Để quản lý từ terminal cục bộ.

## 2. Kích hoạt các API cần thiết

Mở Cloud Shell hoặc sử dụng terminal cục bộ để chạy lệnh:

```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```

## 3. Thiết lập Cloud SQL (Database)

1.  Vào **Cloud SQL** > **Create Instance** > **MySQL**.
2.  Đặt ID instance (ví dụ: `qlhs-db-instance`) và mật khẩu root.
3.  **Lưu lại Connection Name**: định dạng `project-id:region:instance-id`.
4.  Tạo database `qlhs_db` và user `qlhs_user` trong instance.

## 4. Cấu hình Quyền (IAM)

Để Cloud Build có thể deploy lên Cloud Run và kết nối SQL, bạn cần cấp quyền cho Service Account của Cloud Build (thường có dạng `PROJECT_NUMBER@cloudbuild.gserviceaccount.com` hoặc `PROJECT_ID@appspot.gserviceaccount.com`):

1.  Vào **IAM & Admin** > **IAM**.
2.  Tìm Service Account của Cloud Build và thêm các role:
    *   `Cloud Run Admin`
    *   `Cloud SQL Client`
    *   `Service Account User`

## 5. Tạo Cloud Build Trigger

1.  Vào **Cloud Build** > **Triggers** > **Create Trigger**.
2.  **Source**: Kết nối với repository Git của bạn (GitHub/GitLab).
3.  **Configuration**: Chọn **Cloud Build configuration file (yaml)** và chỉ đường dẫn tới `cloudbuild.yaml` ở gốc thư mục.
4.  **Substitution variables**: Đây là bước QUAN TRỌNG NHẤT.

### Các biến Substitution bắt buộc:

| Variable | Giá trị (Ví dụ) | Mô tả |
| :--- | :--- | :--- |
| `_DB_PASS` | `mật-khẩu-db` | **[BẮT BUỘC]** Mật khẩu database. |
| `_JWT_SECRET` | `chuỗi-bí-mật` | **[BẮT BUỘC]** Secret để ký token JWT. |
| `_INSTANCE_CONNECTION_NAME` | `project:asia-southeast1:instance` | **[BẮT BUỘC]** Tên kết nối Cloud SQL. |
| `_VITE_API_URL` | `https://qlhs-server-xxx.run.app/api` | URL của backend (sau khi deploy backend lần đầu). |
| `_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google Client ID cho tính năng login. |

> [!TIP]
> Lần deploy đầu tiên, bạn có thể chưa có `_VITE_API_URL`. Hãy deploy backend trước, lấy URL, sau đó cập nhật trigger và deploy lại.

## 6. Luồng Deploy & Kiểm tra

1.  **Push code**: Mỗi khi bạn push code lên nhánh master, Cloud Build sẽ tự động chạy.
2.  **Kiểm tra Build**: Vào **Cloud Build** > **History** để xem tiến độ.
3.  **Kiểm tra Service**:
    *   Vào **Cloud Run** để xác nhận 2 service `qlhs-server` và `qlhs-web` đã chạy.
    *   Cửa sổ terminal của backend sẽ hiện: `Server is listening on port 8080`.

## 7. Các lưu ý quan trọng (Production)

*   **Strict Env**: Frontend sẽ báo lỗi ngay lập tức (throw error) nếu thiếu `VITE_API_URL` hoặc `VITE_GOOGLE_CLIENT_ID` trong bản build production.
*   **CORS**: Đảm bảo URL của frontend đã được thêm vào danh sách `origin` trong `server/src/index.ts`.
*   **Port**: Cả hai service đều được cấu hình chạy trên port chuẩn **8080**.

---
*Chúc bạn deploy thành công!*
