"""
TopViec Scrapling FastAPI Microservice
Phục vụ cào dữ liệu chi tiết thời gian thực và quản lý crawler cho Next.js
Chạy: python crawler/api_service.py hoặc npm run scrapling:api
"""

import sys
import asyncio
import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from crawler.scrapers.detail_scraper import JobDetailScraper
from crawler.aggregator import run_scrapling_aggregation

app = FastAPI(
    title="TopViec Scrapling Crawler Service",
    description="Microservice cào dữ liệu tuyển dụng IT với Scrapling (Anti-bot bypass & Adaptive selectors)",
    version="1.0.0"
)

# Kích hoạt CORS để Next.js gọi trực tiếp từ trình duyệt hoặc server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeDetailRequest(BaseModel):
    url: str
    platform: Optional[str] = None
    use_stealth: Optional[bool] = False

@app.get("/health")
def health_check():
    """Kiểm tra tình trạng hoạt động của service Scrapling"""
    return {
        "status": "ok",
        "service": "scrapling-crawler-api",
        "engine": "Scrapling v0.5",
        "features": ["StealthyFetcher", "AdaptiveSelectors", "CloudflareBypass"]
    }

@app.post("/api/scrape/detail")
async def scrape_detail_endpoint(req: ScrapeDetailRequest):
    """
    Endpoint cào chi tiết việc làm thời gian thực.
    Next.js gọi endpoint này khi người dùng mở modal xem chi tiết.
    """
    if not req.url:
        raise HTTPException(status_code=400, detail="Thiếu tham số url")

    try:
        loop = asyncio.get_event_loop()
        detail_data = await loop.run_in_executor(
            None,
            JobDetailScraper.scrape,
            req.url,
            req.platform,
            req.use_stealth or False
        )
        return {
            "success": True,
            "data": detail_data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

INTERVAL_HOURS = 6
INTERVAL_SECONDS = INTERVAL_HOURS * 3600

# Trạng thái tiến trình cào
crawl_state = {
    "is_running": False,
    "last_run": None,
    "last_result": None,
    "next_run": None,
    "interval_hours": INTERVAL_HOURS,
    "error": None
}

def background_crawl_task():
    global crawl_state
    crawl_state["is_running"] = True
    crawl_state["error"] = None
    try:
        res = run_scrapling_aggregation()
        crawl_state["last_result"] = res
        now_dt = datetime.datetime.now()
        crawl_state["last_run"] = now_dt.strftime("%Y-%m-%d %H:%M:%S")
        crawl_state["next_run"] = (now_dt + datetime.timedelta(seconds=INTERVAL_SECONDS)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        crawl_state["error"] = str(e)
    finally:
        crawl_state["is_running"] = False

async def periodic_crawl_loop():
    """Vòng lặp tự động cào định kỳ mỗi 6 tiếng"""
    # Đợi 10 giây sau khi server khởi động rồi lên lịch
    await asyncio.sleep(10)
    while True:
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, background_crawl_task)
        except Exception as e:
            print(f"⚠️ Lỗi trong vòng lặp cào định kỳ 6 tiếng: {e}")
        await asyncio.sleep(INTERVAL_SECONDS)

@app.on_event("startup")
async def startup_event():
    """Khởi động tiến trình cào tự động ngầm mỗi 6 tiếng khi service chạy"""
    asyncio.create_task(periodic_crawl_loop())
    print(f"🕒 Đã kích hoạt bộ lập lịch tự động: Cào và cập nhật dữ liệu việc làm IT mỗi {INTERVAL_HOURS} tiếng.")

@app.post("/api/crawl/run")
def trigger_crawl(background_tasks: BackgroundTasks):
    """Kích hoạt tiến trình cào toàn diện chạy nền ngay lập tức"""
    global crawl_state
    if crawl_state["is_running"]:
        return {"success": False, "message": "Tiến trình cào đang chạy dở, vui lòng đợi hoàn tất."}

    background_tasks.add_task(background_crawl_task)
    return {"success": True, "message": "Đã bắt đầu tiến trình cào dữ liệu qua Scrapling trong nền."}

@app.get("/api/crawl/status")
def get_crawl_status():
    """Xem trạng thái tiến trình cào và thời gian đợt cào kế tiếp"""
    return crawl_state

if __name__ == "__main__":
    print(f"🚀 Khởi chạy TopViec Scrapling Service tại http://127.0.0.1:8000...")
    print(f"⏰ Chế độ tự động cào ngầm mỗi {INTERVAL_HOURS} tiếng đã bật!")
    uvicorn.run("crawler.api_service:app", host="127.0.0.1", port=8000, reload=False)

