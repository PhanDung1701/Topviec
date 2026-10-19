# 🕷️ TopViec Scrapling Crawler & Microservice

Hệ thống cào và tổng hợp tin tuyển dụng IT cho TopViec sử dụng framework **[Scrapling](https://github.com/D4Vinci/Scrapling)** (Python 3.12+).

---

## 🌟 Tính Năng Nổi Bật

1. **Self-Healing Adaptive Selectors (Bộ chọn tự thích ứng):**
   - Tự động nhận diện cấu trúc DOM khi các trang tuyển dụng (TopCV, CareerViet, CareerLink, VietnamWorks, v.v.) thay đổi giao diện hoặc đổi tên class CSS.
2. **Anti-Bot & Stealthy Fetcher (Vượt bảo vệ bot & Cloudflare):**
   - Giả lập vân tay TLS chuẩn trình duyệt (Chrome/Firefox) thông qua `curl_cffi` và `Patchright`.
   - Vượt các lớp xác minh Cloudflare Turnstile, DDOS Protection, chống bị chặn mã lỗi 403 Forbidden.
3. **Bộ lọc IT chuyên sâu 100%:**
   - Tập trung: IT Support, Helpdesk, System Admin, Network Engineer, Security, Cloud/DevOps.
   - Loại bỏ triệt để các ngành không liên quan (Kế toán, Telesale, Bán hàng, Lễ tân, Xây dựng, HVAC...).
   - Loại bỏ tin đăng quá 30 ngày.
4. **Đối chiếu chéo & Gộp tin trùng lặp (Deduplication):**
   - Tự động phát hiện cùng một công việc được đăng trên nhiều sàn (Cross-posting) bằng mã băm fingerprint MD5.
5. **Tích hợp kép:**
   - **CLI Tool:** Chạy độc lập cào định kỳ và đồng bộ trực tiếp vào `src/data/mockJobs.ts`.
   - **Local FastAPI Microservice:** Chạy nền (port 8000) để ứng dụng Next.js gọi cào chi tiết bài đăng thời gian thực khi người dùng bấm xem công việc.

---

## 📁 Cấu Trúc Thư Mục

```text
crawler/
├── api_service.py              # FastAPI server phục vụ Next.js (port 8000)
├── aggregator.py               # CLI cào định kỳ & đồng bộ mockJobs.ts
├── config.py                   # Từ khóa IT, bộ lọc disqualifier, thuật toán băm fingerprint
├── requirements.txt            # Danh sách thư viện Python
├── jobs_backup.json            # Bản sao lưu dữ liệu JSON mới nhất
└── scrapers/
    ├── __init__.py
    ├── detail_scraper.py       # Scrapling extractor chi tiết tin (Mô tả, Yêu cầu, Quyền lợi, Lương)
    └── list_scraper.py         # Scrapling extractor danh sách việc làm từ các sàn
```

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Cào và Cập Nhật Dữ Liệu Việc Làm (CLI)
Để chạy cào mới nhất từ các sàn tuyển dụng và cập nhật trực tiếp vào `src/data/mockJobs.ts`:

```bash
npm run scrapling:crawl
```
*Hoặc qua Python trực tiếp:*
```powershell
.\.venv\Scripts\python crawler/aggregator.py
```

### 2. Khởi Chạy Local API Service cho Next.js
Để Next.js có thể cào thông tin chi tiết các bài đăng có bảo vệ bot/Cloudflare trong thời gian thực:

```bash
npm run scrapling:api
```
*Hoặc qua Python trực tiếp:*
```powershell
.\.venv\Scripts\python crawler/api_service.py
```
API sẽ hoạt động tại `http://127.0.0.1:8000`:
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `GET /health`
- **Scrape Detail Endpoint:** `POST /api/scrape/detail`
  ```json
  {
    "url": "https://www.topcv.vn/viec-lam/...",
    "use_stealth": false
  }
  ```

---

## 🛠️ Quản Lý Môi Trường Ảo (.venv)
Môi trường ảo đã được thiết lập sẵn tại `.venv` ở thư mục gốc dự án:
- Thư viện đã cài: `scrapling[all]`, `playwright`, `patchright`, `fastapi`, `uvicorn`.
- Cập nhật dependencies (nếu cần):
  ```powershell
  .\.venv\Scripts\pip install -r crawler/requirements.txt
  .\.venv\Scripts\scrapling install
  ```
