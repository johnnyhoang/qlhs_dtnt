# Hướng dẫn sửa Cloud Build Trigger

## Vấn đề hiện tại
Cloud Build đang đọc `cloudbuild.yaml` như một Dockerfile, gây ra lỗi:
```
Error response from daemon: dockerfile parse error line 1: unknown instruction: STEPS:
```

## Giải pháp: Cấu hình lại Trigger

### Cách 1: Sửa trigger hiện tại (Khuyến nghị)

1. Mở Google Cloud Console: https://console.cloud.google.com/cloud-build/triggers
2. Tìm trigger đang chạy (thường có tên tự động hoặc liên kết với repo)
3. Click vào trigger → Click nút **EDIT** ở góc trên
4. Tìm phần **Configuration** (hoặc **Build Configuration**):
   - **Type**: Chọn **Cloud Build configuration file (yaml or json)**
   - **Location**: Chọn **Repository**
   - **Cloud Build configuration file location**: Nhập `/cloudbuild.yaml`
5. Click **SAVE**

### Cách 2: Tạo trigger mới bằng gcloud CLI

Nếu bạn có gcloud CLI đã cài đặt và authenticated:

```bash
# Xem danh sách triggers hiện tại
gcloud builds triggers list

# Xóa trigger cũ (thay YOUR_TRIGGER_ID)
gcloud builds triggers delete YOUR_TRIGGER_ID

# Tạo trigger mới
gcloud builds triggers create github \
  --repo-name=qlhs_dtnt \
  --repo-owner=johnnyhoang \
  --branch-pattern=^master$ \
  --build-config=cloudbuild.yaml \
  --name=deploy-qlhs-master
```

### Cách 3: Tạo trigger mới qua Console

1. Vào https://console.cloud.google.com/cloud-build/triggers
2. Click **CREATE TRIGGER**
3. Điền thông tin:
   - **Name**: `deploy-qlhs-master`
   - **Event**: Push to a branch
   - **Source**: 
     - Repository: `johnnyhoang/qlhs_dtnt`
     - Branch: `^master$`
   - **Configuration**:
     - Type: **Cloud Build configuration file (yaml or json)**
     - Location: **Repository**
     - Cloud Build configuration file location: `/cloudbuild.yaml`
4. Click **CREATE**

## Kiểm tra sau khi sửa

1. Trigger một build thủ công từ Cloud Build console
2. Hoặc push một commit nhỏ lên master branch
3. Xem logs tại: https://console.cloud.google.com/cloud-build/builds

Build sẽ thành công khi bạn thấy các bước:
- ✓ Build server image
- ✓ Build web image
- ✓ Push images
- ✓ Deploy to Cloud Run

## Lưu ý quan trọng

Sau khi trigger chạy thành công lần đầu, bạn cần:
1. Cấu hình **environment variables** cho Cloud Run services (DB connection, secrets)
2. Kết nối **Cloud SQL** hoặc external database
3. Cập nhật **VITE_API_URL** trong frontend để trỏ đến backend URL
