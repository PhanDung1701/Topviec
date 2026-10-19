"""
TopViec Automated 6-Hour Background Crawler Scheduler
Tự động kích hoạt cào và cập nhật dữ liệu việc làm IT mới nhất mỗi 6 tiếng.
Chạy: python crawler/scheduler.py hoặc npm run scrapling:schedule
"""

import sys
import time
import datetime
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from crawler.aggregator import run_scrapling_aggregation

INTERVAL_HOURS = 6
INTERVAL_SECONDS = INTERVAL_HOURS * 3600

def run_scheduler():
    print("=============================================================")
    print("🕒 TOPVIEC AUTOMATED CRAWLER SCHEDULER")
    print(f"⏰ Tần suất cập nhật: Mỗi {INTERVAL_HOURS} tiếng một lần")
    print("🎯 Thu thập & đối chiếu 100% IT Jobs (TopCV, VietnamWorks, CareerLink, JobsGO, CareerViet)")
    print("=============================================================\n")

    iteration = 0
    while True:
        iteration += 1
        start_time = datetime.datetime.now()
        print(f"\n[Lần {iteration}] Bắt đầu chu kỳ cào dữ liệu lúc: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")

        try:
            res = run_scrapling_aggregation()
            finished_time = datetime.datetime.now()
            duration = (finished_time - start_time).total_seconds()
            print(f"✅ Hoàn thành chu kỳ {iteration} trong {duration:.1f}s!")
            print(f"📊 Kết quả: {res.get('final_count', 0)} việc làm IT sạch, đã lưu vào src/data/mockJobs.ts")
        except Exception as e:
            print(f"❌ Lỗi trong quá trình cào chu kỳ {iteration}: {e}")

        next_run = datetime.datetime.now() + datetime.timedelta(seconds=INTERVAL_SECONDS)
        print(f"\n⏳ Đang chờ chu kỳ tiếp theo...")
        print(f"📅 Dự kiến lần cào tới: {next_run.strftime('%Y-%m-%d %H:%M:%S')} (sau {INTERVAL_HOURS} tiếng)")
        print("💡 Nhấn Ctrl+C để dừng tiến trình.\n")

        # Sleep with periodic 60s checks so it's interruptible
        elapsed = 0
        while elapsed < INTERVAL_SECONDS:
            sleep_step = min(60, INTERVAL_SECONDS - elapsed)
            time.sleep(sleep_step)
            elapsed += sleep_step

if __name__ == "__main__":
    try:
        run_scheduler()
    except KeyboardInterrupt:
        print("\n🛑 Đã dừng tiến trình tự động cào định kỳ.")
        sys.exit(0)
