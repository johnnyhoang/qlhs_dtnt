# Hướng dẫn Test Postman & Deploy chỉ Web

## 1. Cách Test Server bằng Postman

Để test API production, bạn sử dụng các thông tin sau:

- **Base URL**: `https://qlhs-server-311534268252.asia-southeast1.run.app/api`
- **Headers**: 
    - `Content-Type`: `application/json`
    - `Authorization`: `Bearer <token_của_bạn>` (Lấy từ localStorage sau khi login web)

### Các Endpoint test nhanh:
1.  **Kiểm tra Health (Không cần login)**:
    - Method: `GET`
    - URL: `{{BaseURL}}/health`
2.  **Lấy danh sách học sinh (Cần login)**:
    - Method: `GET`
    - URL: `{{BaseURL}}/hoc-sinh`
    - Header: Thêm `Authorization` bearer token.

---

## 2. Cách tự Deploy riêng Web (không deploy Server)

Nếu server đã chạy ổn và bạn chỉ muốn cập nhật giao diện, hãy làm theo cách này để tiết kiệm thời gian và chi phí:

### Cách A: Tạo file cấu hình riêng (Khuyên dùng)
Tôi đã tạo thêm file `cloudbuild-web.yaml`. Bạn có thể chạy lệnh sau trong Cloud Shell hoặc terminal:

```bash
gcloud builds submit --config cloudbuild-web.yaml .
```

### Cách B: Chạy lệnh gcloud trực tiếp
Nếu bạn không muốn dùng file yaml, bạn có thể chạy chuỗi lệnh này (thay các biến tương ứng):

```bash
# 1. Build image (ở thư mục gốc project)
docker build -t gcr.io/[PROJECT_ID]/qlhs-web:latest \
  --build-arg VITE_API_URL=[URL_SERVER] \
  --build-arg VITE_GOOGLE_CLIENT_ID=[ID_GOOGLE] \
  -f web/Dockerfile ./web

# 2. Push image
docker push gcr.io/[PROJECT_ID]/qlhs-web:latest

# 3. Deploy lên Cloud Run
gcloud run deploy qlhs-web \
  --image gcr.io/[PROJECT_ID]/qlhs-web:latest \
  --region asia-southeast1 \
  --port 8080 \
  --platform managed \
  --allow-unauthenticated
```
