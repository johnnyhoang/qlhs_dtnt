# Hướng dẫn Kết nối Database đúng cách (Cloud Run & Cloud SQL)

Nếu Postman báo `database: disconnected`, hãy kiểm tra và thực hiện đúng 5 bước sau:

## Bước 1: Lấy đúng "Tên kết nối" (Connection Name)
1.  Truy cập [GCP Console - Cloud SQL](https://console.cloud.google.com/sql/instances).
2.  Click vào tên instance của bạn (ví dụ: `qlhs-db-instance`).
3.  Tìm dòng **Connection name** ở tab "Overview". 
    -   *Định dạng:* `project-id:asia-southeast1:instance-id`

## Bước 2: Cấp quyền IAM (Rất quan trọng)
Service Account cần quyền `Cloud SQL Client` để "nhìn thấy" database.
1.  Vào **IAM & Admin** > **IAM**.
2.  Tìm Service Account của **Cloud Build** (thường có tên `...-compute@developer.gserviceaccount.com` hoặc `...@cloudbuild.gserviceaccount.com`).
3.  Bấm Edit (biểu tượng bút chì) > **Add another role**.
4.  Chọn role: **Cloud SQL Client**.
5.  *Lưu ý:* Làm tương tự cho Service Account của **Cloud Run** nếu nó khác.

## Bước 3: Cấu hình trong cloudbuild.yaml
Đảm bảo file `cloudbuild.yaml` của bạn có chỉ dẫn kết nối instance:
```yaml
# Trong bước deploy qlhs-server
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    args:
      - 'run'
      - 'deploy'
      - 'qlhs-server'
      # ... các tham số khác ...
      - '--add-cloudsql-instances'
      - '$_INSTANCE_CONNECTION_NAME' # Tên lấy ở Bước 1
```

## Bước 4: Thiết lập biến Substitutions trong Trigger
Vào **Cloud Build** > **Triggers** > Edit Trigger của bạn > Tab **Substitutions**. Thiết lập:

| Biến | Giá trị chuẩn |
| :--- | :--- |
| `_INSTANCE_CONNECTION_NAME` | `project:region:instance` (Lấy ở Bước 1) |
| `_DB_SOCKET_PATH` | `/cloudsql/project:region:instance` (Thêm tiền tố `/cloudsql/`) |
| `_DB_USER` | `qlhs_user` (Phải trùng với user đã tạo trong Cloud SQL) |
| `_DB_PASS` | `mật-khẩu` |
| `_DB_NAME` | `qlhs_db` (Phải trùng với database đã tạo trong Cloud SQL) |

## Bước 5: Kiểm tra Source Code (Tôi đã làm giúp bạn)
Trong `server/src/data-source.ts`, code phải ưu tiên `socketPath`:
```typescript
...(CONFIG.DB.SOCKET_PATH ? {
    socketPath: CONFIG.DB.SOCKET_PATH,
} : {
    host: CONFIG.DB.HOST,
    port: 3306,
})
```

### Tại sao lại dùng Socket thay vì IP?
Trên Cloud Run, kết nối qua Unix Socket (`/cloudsql/...`) là cách an toàn và nhanh nhất, không cần mở firewall IP hay dùng Cloud SQL Proxy thủ công.

---
**Sau khi kiểm tra xong 5 bước trên, hãy bấm Deploy lại!**
Nếu vẫn lỗi, hãy gọi `/api/health` và đọc trường `error` để biết chi tiết.
