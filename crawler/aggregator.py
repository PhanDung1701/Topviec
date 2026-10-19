"""
TopViec Master Aggregator & Deduplication Engine Powered by Scrapling
Chạy độc lập bằng CLI: python crawler/aggregator.py
Đồng bộ trực tiếp vào src/data/mockJobs.ts
"""

import os
import sys
import json
import re
import datetime
from pathlib import Path
from typing import Dict, List, Any

# Thêm đường dẫn gốc vào sys.path để import crawler module
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from crawler.config import (
    is_strictly_it_job,
    generate_fingerprint,
    detect_it_subfield,
    extract_skills
)
from crawler.scrapers.list_scraper import ListScraper

TOPCV_ENDPOINTS = [
    'https://www.topcv.vn/tim-viec-lam-it-support?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-nhan-vien-it?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-system-admin?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-network-engineer?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-it-helpdesk?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-quan-tri-mang?type_keyword=1',
    'https://www.topcv.vn/tim-viec-lam-quan-tri-he-thong?type_keyword=1'
]

CAREERVIET_ENDPOINTS = [
    'https://careerviet.vn/viec-lam/it-support-k-vi.html',
    'https://careerviet.vn/viec-lam/nhan-vien-it-k-vi.html',
    'https://careerviet.vn/viec-lam/network-k-vi.html',
    'https://careerviet.vn/viec-lam/system-admin-k-vi.html'
]

def load_existing_jobs() -> List[Dict[str, Any]]:
    """Đọc dữ liệu việc làm hiện có trong mockJobs.ts để bảo toàn và cập nhật"""
    target_file = ROOT_DIR / 'src' / 'data' / 'mockJobs.ts'
    if not target_file.exists():
        return []
    try:
        content = target_file.read_text(encoding='utf-8')
        eq_pos = content.find('= [')
        if eq_pos == -1:
            eq_pos = content.find(':[')
        if eq_pos == -1:
            return []
        json_start = content.find('[', eq_pos)
        json_end = content.rfind(']')
        if json_start != -1 and json_end != -1:
            json_str = content[json_start:json_end+1]
            return json.loads(json_str)
    except Exception as e:
        print(f"⚠️ Không thể đọc mockJobs.ts hiện tại: {e}")
    return []

def run_scrapling_aggregation():
    """Hàm tổng hợp chính cào và đối chiếu toàn bộ các sàn"""
    print('\n=============================================================')
    print('🚀 TOPVIEC AGGREGATOR ENGINE POWERED BY SCRAPLING (Python)')
    print('🎯 Mục tiêu: 100% IT Support, System, Network, Helpdesk, Admin')
    print('🛡️ Tính năng: Adaptive Selectors & Anti-bot Stealth Bypass')
    print('⏰ Bộ lọc: Còn hiệu lực, <= 30 ngày, Không trùng lặp (Deduplicated)')
    print('=============================================================\n')

    dedup_map: Dict[str, Dict[str, Any]] = {}
    total_raw = 0
    dedup_count = 0

    # 1. Tải danh sách việc làm hiện có
    existing_jobs = load_existing_jobs()
    print(f"📂 Đã tải {len(existing_jobs)} việc làm nền tảng hiện có từ mockJobs.ts...")
    for j in existing_jobs:
        fp = j.get('fingerprint_hash') or generate_fingerprint(j.get('title', ''), j.get('company_name', ''), j.get('location_city', ''))
        j['fingerprint_hash'] = fp
        dedup_map[fp] = j
        total_raw += 1

    # 2. Cào TopCV với Scrapling
    print('📡 Đang cào dữ liệu mới từ TopCV qua Scrapling...')
    for ep in TOPCV_ENDPOINTS:
        try:
            jobs = ListScraper.crawl_topcv(ep)
            total_raw += len(jobs)
            for j in jobs:
                fp = j['fingerprint_hash']
                if fp in dedup_map:
                    dedup_count += 1
                    existing = dedup_map[fp]
                    cross = existing.get('source_cross_posted') or [existing.get('source_platform')]
                    if j['source_platform'] not in cross:
                        cross.append(j['source_platform'])
                    existing['source_cross_posted'] = cross
                else:
                    dedup_map[fp] = j
        except Exception as e:
            print(f"⚠️ Lỗi cào {ep}: {e}")

    # 3. Cào CareerViet với Scrapling
    print('📡 Đang cào dữ liệu mới từ CareerViet qua Scrapling...')
    for ep in CAREERVIET_ENDPOINTS:
        try:
            jobs = ListScraper.crawl_careerviet(ep)
            total_raw += len(jobs)
            for j in jobs:
                fp = j['fingerprint_hash']
                if fp in dedup_map:
                    dedup_count += 1
                    existing = dedup_map[fp]
                    cross = existing.get('source_cross_posted') or [existing.get('source_platform')]
                    if j['source_platform'] not in cross:
                        cross.append(j['source_platform'])
                    existing['source_cross_posted'] = cross
                else:
                    dedup_map[fp] = j
        except Exception as e:
            print(f"⚠️ Lỗi cào {ep}: {e}")

    # 4. Cào VietnamWorks 100% link gốc trực tiếp
    print('📡 Đang cào dữ liệu mới từ VietnamWorks (100% direct links)...')
    for kw in ['IT Support', 'System Admin', 'Network Engineer', 'IT Helpdesk']:
        try:
            jobs = ListScraper.crawl_vietnamworks(kw)
            total_raw += len(jobs)
            for j in jobs:
                fp = j['fingerprint_hash']
                if fp in dedup_map:
                    dedup_count += 1
                    existing = dedup_map[fp]
                    cross = existing.get('source_cross_posted') or [existing.get('source_platform')]
                    if j['source_platform'] not in cross:
                        cross.append(j['source_platform'])
                    existing['source_cross_posted'] = cross
                else:
                    dedup_map[fp] = j
        except Exception as e:
            print(f"⚠️ Lỗi cào VietnamWorks {kw}: {e}")

    # 5. Cào CareerLink 100% link gốc trực tiếp
    print('📡 Đang cào dữ liệu mới từ CareerLink (100% direct links)...')
    for kw in ['it-support', 'nhan-vien-it', 'system-admin', 'network-engineer']:
        try:
            jobs = ListScraper.crawl_careerlink(kw)
            total_raw += len(jobs)
            for j in jobs:
                fp = j['fingerprint_hash']
                if fp in dedup_map:
                    dedup_count += 1
                    existing = dedup_map[fp]
                    cross = existing.get('source_cross_posted') or [existing.get('source_platform')]
                    if j['source_platform'] not in cross:
                        cross.append(j['source_platform'])
                    existing['source_cross_posted'] = cross
                else:
                    dedup_map[fp] = j
        except Exception as e:
            print(f"⚠️ Lỗi cào CareerLink {kw}: {e}")

    final_jobs = list(dedup_map.values())

    # Thống kê theo sàn
    platform_stats: Dict[str, int] = {}
    for j in final_jobs:
        plat = j.get('source_platform', 'UNKNOWN')
        platform_stats[plat] = platform_stats.get(plat, 0) + 1

    # Ghi trực tiếp ra file TypeScript mockJobs.ts
    target_path = ROOT_DIR / 'src' / 'data' / 'mockJobs.ts'
    backup_path = ROOT_DIR / 'crawler' / 'jobs_backup.json'

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    ts_content = f"""import {{ JobListing }} from "@/types/job";

// 100% Real Live Filtered IT Jobs (IT Support, System, Network, Helpdesk, Admin, Nhân viên IT)
// Tự động thu thập & đối chiếu bởi Scrapling (crawler/aggregator.py)
// Cập nhật: {now_iso}
// Tổng số: {len(final_jobs)} việc làm IT sạch, thời hạn <= 30 ngày
export const MOCK_JOBS: JobListing[] = {json.dumps(final_jobs, ensure_ascii=False, indent=2)};
"""

    target_path.write_text(ts_content, encoding='utf-8')
    backup_path.write_text(json.dumps(final_jobs, ensure_ascii=False, indent=2), encoding='utf-8')

    print('\n=============================================================')
    print('✅ HOÀN TẤT ĐỐI CHIẾU & ĐỒNG BỘ DỮ LIỆU TUYỂN DỤNG IT VỚI SCRAPLING!')
    print(f'📦 Tổng số tin thô duyệt qua:        {total_raw}')
    print(f'🔄 Số tin trùng lặp đã gộp (Dedupe): {dedup_count}')
    print(f'⭐ Tổng số tin IT sạch lưu trữ:       {len(final_jobs)}')
    print('📊 Phân bố tuyển dụng theo tất cả các sàn:')
    print(json.dumps(platform_stats, indent=2))
    print(f'💾 Đã đồng bộ trực tiếp vào: {target_path}')
    print(f'📁 Đã lưu bản sao lưu tại: {backup_path}')
    print('=============================================================\n')
    return {
        "total_raw": total_raw,
        "dedup_count": dedup_count,
        "final_count": len(final_jobs),
        "platform_stats": platform_stats
    }

if __name__ == '__main__':
    run_scrapling_aggregation()
