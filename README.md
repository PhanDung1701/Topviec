# TopViec AI

TopViec AI là ứng dụng tổng hợp việc làm IT, lọc tin còn hạn, gộp tin trùng và chấm mức độ phù hợp giữa CV với mô tả công việc.

## Kiến trúc dữ liệu

- **8 nguồn truy vấn trực tiếp:** TopCV, VietnamWorks, Vieclam24h, CareerViet, JobsGO, CareerLink, Joboko và Indeed. Next.js tải và chuẩn hóa dữ liệu từ trang nguồn khi người dùng tìm kiếm hoặc làm mới.
- **Dữ liệu dự phòng:** `src/data/mockJobs.ts` lưu lần đồng bộ gần nhất và chỉ được dùng khi một nguồn tạm thời không phản hồi hoặc chặn truy vấn tự động.
- **Crawler Python tùy chọn:** FastAPI + Scrapling dùng để làm giàu chi tiết việc làm và cập nhật snapshot. Trên production, service này phải được deploy riêng.
- **Fallback:** Nếu crawler Python không khả dụng, Next.js vẫn tự truy vấn trực tiếp cả 8 nguồn; snapshot gần nhất chỉ bảo đảm giao diện không bị trống khi nguồn ngoài lỗi.

## Công nghệ

- Next.js 16.4, React 19, TypeScript, Tailwind CSS 4
- FastAPI, Scrapling và Uvicorn
- `pdf-parse` và `fflate` để trích xuất nội dung CV PDF/DOCX

## Chạy local

Yêu cầu Node.js 22.3+ và Python 3.12+.

```powershell
npm install
npm run dev
```

Mở <http://localhost:3000>.

Để chạy thêm crawler Python:

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r crawler\requirements.txt
npm run scrapling:api
```

Mặc định, bản development tìm crawler tại `http://127.0.0.1:8000`.

## Biến môi trường

Sao chép `.env.example` thành `.env.local`:

```dotenv
CRON_SECRET=replace-with-a-random-secret
CRAWLER_API_URL=https://crawler.example.com
CRAWLER_API_TOKEN=replace-with-a-shared-secret
```

- `CRON_SECRET`: bảo vệ endpoint `/api/cron/crawl`. Vercel tự gửi giá trị này trong header cron.
- `CRAWLER_API_URL`: địa chỉ FastAPI đã deploy; không đặt `127.0.0.1` trên Vercel.
- `CRAWLER_API_TOKEN`: token dùng chung giữa Next.js và FastAPI.
- `CRAWLER_ALLOWED_ORIGINS`: cấu hình phía FastAPI, danh sách origin cách nhau bởi dấu phẩy; mặc định là `http://localhost:3000`.

## Lệnh hữu ích

```powershell
npm run lint
npm run build
npm run scrapling:crawl
npm run scrapling:api
npm run scrapling:schedule
```

## API chính

- `GET /api/jobs`: truy vấn song song 8 nguồn và trả danh sách việc làm cùng metadata về kết quả trực tiếp/dự phòng.
- `POST /api/jobs`: làm mới dữ liệu thật; nếu crawler service được cấu hình, endpoint cũng kích hoạt service đó.
- `GET /api/jobs/detail`: lấy và làm giàu chi tiết một tin tuyển dụng.
- `POST /api/cv/extract`: trích xuất văn bản từ CV PDF, DOCX hoặc TXT, tối đa 10 MB.
- `GET /api/cron/crawl`: endpoint dành cho Vercel Cron hoặc cron runner ngoài.

## Deploy

### Next.js trên Vercel

1. Cấu hình `CRON_SECRET`.
2. Nếu cần pipeline Python, deploy thư mục `crawler/` lên một dịch vụ chạy Python lâu dài như Railway, Render, Fly.io hoặc Cloud Run.
3. Cấu hình `CRAWLER_API_URL` và `CRAWLER_API_TOKEN` trên cả hai phía.
4. `vercel.json` chạy cron mỗi ngày, phù hợp giới hạn Vercel Hobby.

Filesystem của Vercel không phải kho lưu trữ lâu dài. Nếu cần duy trì dữ liệu dự phòng qua nhiều lần deploy, crawler Python phải dùng storage/database bền vững hoặc cập nhật snapshot trong quá trình CI.

### Self-host

Có thể chạy Next.js và FastAPI trên cùng máy. Trong development, Next.js tự dùng `127.0.0.1:8000`; trong production vẫn nên đặt `CRAWLER_API_URL` rõ ràng.

## Lưu ý CV

- PDF phải có lớp văn bản; PDF scan ảnh cần OCR riêng.
- DOCX được đọc dưới dạng văn bản thuần.
- Nội dung CV được xử lý trong request và không được ghi xuống filesystem bởi endpoint Next.js.
