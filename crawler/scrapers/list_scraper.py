"""
TopViec Multi-Portal List Crawler Powered by Scrapling
Cào danh sách tuyển dụng từ các sàn lớn với bộ lọc IT và chống bot
"""

import json
import re
import datetime
from typing import List, Dict, Any
from scrapling import Fetcher, StealthyFetcher, Selector
from crawler.config import (
    is_strictly_it_job,
    detect_it_subfield,
    extract_skills,
    generate_fingerprint
)

def parse_salary_range(salary_text: str):
    text = (salary_text or '').lower()
    currency = 'USD' if ('usd' in text or '$' in text) else 'VND'
    min_sal = 15
    max_sal = 30
    nums = [int(n) for n in re.findall(r'\b\d+\b', text)]
    if len(nums) >= 2:
        min_sal = min(nums[0], nums[1])
        max_sal = max(nums[0], nums[1])
    elif len(nums) == 1:
        if 'trên' in text or 'từ' in text:
            min_sal = nums[0]
            max_sal = nums[0] * 2
        else:
            min_sal = max(5, nums[0] // 2)
            max_sal = nums[0]
    return min_sal, max_sal, currency

class ListScraper:
    """Scrapling List Scraper for Vietnam IT Job Boards"""

    @staticmethod
    def crawl_topcv(url: str) -> List[Dict[str, Any]]:
        """Cào tin tuyển dụng từ TopCV bằng Scrapling StealthyFetcher / Fetcher"""
        jobs = []
        try:
            # Dùng StealthyFetcher để đảm bảo vượt bot / dynamic render của TopCV
            res = StealthyFetcher.fetch(
                url,
                headless=True,
                solve_cloudflare=True,
                timeout=25000,
                network_idle=True
            )
            if not res or res.status != 200:
                return jobs

            cards = res.css('.job-item-search-result, .job-item-2024')
            for idx, card in enumerate(cards):
                job_id = card.attrib.get('data-job-id') or f"tcv-{int(datetime.datetime.now().timestamp())}-{idx}"

                # Title & Link
                title = (
                    card.css('.title a span::text').get() or
                    card.css('.title a::attr(data-original-title)').get() or
                    card.css('.title a::attr(title)').get() or
                    card.css('img::attr(title)').get() or
                    card.css('h3 a::text').get() or
                    ""
                ).strip()

                if not title or not is_strictly_it_job(title):
                    continue

                link = card.css('.title a::attr(href), a.title::attr(href), h3 a::attr(href)').get() or ""
                if link and link.startswith('/'):
                    link = f"https://www.topcv.vn{link}"
                link = link.split('?')[0] if link else url

                # Company
                company = (
                    card.css('img::attr(alt)').get() or
                    card.css('.company-name::text').get() or
                    card.css('a.company::text').get() or
                    "Doanh nghiệp IT"
                ).strip()

                # Logo
                logo = (
                    card.css('img::attr(src)').get() or
                    card.css('img::attr(data-src)').get() or
                    "https://cdn-icons-png.flaticon.com/512/1006/1006771.png"
                )

                # Salary
                salary = (card.css('.title-salary::text, .salary::text').get() or "Thỏa thuận").strip()
                min_sal, max_sal, curr = parse_salary_range(salary)

                # City
                city = (card.css('.city-text::text, .address::text').get() or "Hà Nội").strip()
                if any(x in city for x in ['Hồ Chí Minh', 'TP HCM', 'TP.HCM', 'Sài Gòn']):
                    city = 'Hồ Chí Minh'
                elif 'Đà Nẵng' in city:
                    city = 'Đà Nẵng'

                update_time = (card.css('.label-update::text, [class*="update"]::text').get() or "").strip()
                if 'tháng' in update_time or 'năm' in update_time:
                    continue

                fp = generate_fingerprint(title, company, city)
                now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

                jobs.append({
                    "id": f"tcv-{job_id}",
                    "title": title,
                    "company_name": company,
                    "company_logo": logo,
                    "location_city": city,
                    "location_district": "",
                    "address_detail": f"{city}, Việt Nam",
                    "salary_min": min_sal,
                    "salary_max": max_sal,
                    "salary_currency": curr,
                    "salary_raw_text": salary,
                    "description": f"{company} tuyển dụng {title}. Chịu trách nhiệm bảo trì, vận hành hệ thống hạ tầng mạng LAN/WAN, máy chủ và trang thiết bị CNTT của doanh nghiệp.",
                    "requirements": [
                        f"Có kinh nghiệm thực tế tại vị trí {title} hoặc tương đương.",
                        "Nắm vững kiến thức hệ thống mạng LAN/WAN, Router/Switch, Firewall, Windows Server, Linux.",
                        "Kỹ năng hỗ trợ kỹ thuật, xử lý sự cố phần cứng, phần mềm nhanh nhạy."
                    ],
                    "benefits": [
                        f"Mức thu nhập: {salary}",
                        "Được đóng đầy đủ BHXH, BHYT, BHTN theo quy định nhà nước",
                        "Thưởng tháng lương 13, thưởng các dịp Lễ, Tết"
                    ],
                    "skills_tags": extract_skills(title),
                    "job_type": "FULL_TIME",
                    "experience_level": "SENIOR" if "senior" in title.lower() else "MIDDLE",
                    "industry": "Công nghệ thông tin / Hạ tầng IT / Network / System",
                    "it_subfield": detect_it_subfield(title),
                    "source_platform": "TOPCV",
                    "source_url": link,
                    "source_job_id": f"TCV-{job_id}",
                    "fingerprint_hash": fp,
                    "posted_at": now_iso,
                    "crawled_at": now_iso,
                    "expires_at": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=28)).isoformat(),
                    "is_active": True,
                    "is_expired": False,
                    "update_time_text": update_time or "Mới cập nhật"
                })
        except Exception as e:
            pass
        return jobs

    @staticmethod
    def crawl_careerviet(url: str) -> List[Dict[str, Any]]:
        """Cào tin CareerViet bằng Scrapling"""
        jobs = []
        try:
            res = Fetcher.get(
                url,
                timeout=12,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept-Language': 'vi-VN,vi;q=0.9',
                    'Referer': 'https://careerviet.vn/'
                }
            )
            if res.status != 200:
                return jobs

            html_text = res.text
            start_str = 'initialJobs\\":{\\"success\\":true,\\"message\\":\\"Success\\",\\"data\\":['
            start_idx = html_text.find(start_str)

            if start_idx != -1:
                data_start = start_idx + len(start_str) - 1
                depth = 0
                end_idx = -1
                for i in range(data_start, len(html_text)):
                    if html_text[i] == '[':
                        depth += 1
                    elif html_text[i] == ']':
                        depth -= 1
                        if depth == 0:
                            end_idx = i + 1
                            break

                if end_idx != -1:
                    raw_json_str = html_text[data_start:end_idx].replace('\\"', '"').replace('\\\\', '\\')
                    raw_list = json.loads(raw_json_str)

                    for j in raw_list:
                        title = j.get('job_title', '').strip()
                        if not is_strictly_it_job(title):
                            continue

                        job_id = j.get('job_id', '')
                        company = j.get('emp_name') or 'Doanh nghiệp IT'
                        logo = j.get('emp_logo') or 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'
                        loc_names = j.get('location_name') or []
                        city = loc_names[0] if isinstance(loc_names, list) and loc_names else 'Toàn quốc'

                        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
                        real_url = f"https://careerviet.vn/vi/tim-viec-lam/{slug}.{job_id}.html"

                        fp = generate_fingerprint(title, company, city)
                        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

                        jobs.append({
                            "id": f"crv-{job_id}",
                            "title": title,
                            "company_name": company,
                            "company_logo": logo,
                            "location_city": city,
                            "location_district": "",
                            "address_detail": f"{city}, Việt Nam",
                            "salary_min": 15,
                            "salary_max": 35,
                            "salary_currency": "VND",
                            "salary_raw_text": "Thỏa thuận",
                            "description": f"{company} tuyển dụng {title}. Chịu trách nhiệm triển khai, giám sát và vận hành hệ thống mạng, hạ tầng CNTT, an ninh mạng và hỗ trợ người dùng.",
                            "requirements": [
                                f"Có kinh nghiệm thực tế ở vị trí {title} hoặc tương đương.",
                                "Nắm vững kiến thức chuyên sâu về mạng (Cisco, Routing/Switching), máy chủ (Windows Server, Linux).",
                                "Khả năng làm việc nhóm và xử lý sự cố linh hoạt."
                            ],
                            "benefits": [
                                "Thu nhập cạnh tranh theo năng lực, xét tăng lương định kỳ hàng năm",
                                "Chế độ BHXH, BHYT và bảo hiểm sức khỏe nâng cao",
                                "Thưởng dự án, thưởng Lễ Tết và tháng lương 13"
                            ],
                            "skills_tags": extract_skills(title),
                            "job_type": "FULL_TIME",
                            "experience_level": "SENIOR" if "senior" in title.lower() else "MIDDLE",
                            "industry": "Công nghệ thông tin / Hạ tầng mạng / IT Support",
                            "it_subfield": detect_it_subfield(title),
                            "source_platform": "CAREERVIET",
                            "source_url": real_url,
                            "source_job_id": f"CRV-{job_id}",
                            "fingerprint_hash": fp,
                            "posted_at": j.get('job_active_date') or now_iso,
                            "crawled_at": now_iso,
                            "expires_at": j.get('job_last_date') or (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=25)).isoformat(),
                            "is_active": True,
                            "is_expired": False,
                            "update_time_text": "Cập nhật gần đây"
                        })
        except Exception as e:
            pass
        return jobs

    @staticmethod
    def crawl_vietnamworks(query: str = "IT Support") -> List[Dict[str, Any]]:
        """Cào tin trực tiếp 100% link gốc từ VietnamWorks API"""
        jobs = []
        try:
            import urllib.request
            url = "https://ms.vietnamworks.com/job-search/v1.0/search"
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            payload = {"query": query, "filter": [], "ranges": [], "order": [], "hitsPerPage": 20, "page": 0}
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                for item in data.get("data", []):
                    j_url = item.get("jobUrl")
                    title = item.get("jobTitle")
                    if not j_url or not title or not j_url.endswith("-jv") or not is_strictly_it_job(title):
                        continue
                    company = item.get("companyName") or "Doanh nghiệp IT"
                    city = item.get("locationDesc") or "Hà Nội"
                    if "Hồ Chí Minh" in city or "TP.HCM" in city:
                        city = "Hồ Chí Minh"
                    elif "Hà Nội" in city:
                        city = "Hà Nội"
                    salary_raw = item.get("prettySalary") or "Thương lượng"
                    min_sal, max_sal, curr = parse_salary_range(salary_raw)
                    logo = item.get("companyLogo") or "https://cdn-icons-png.flaticon.com/512/1006/1006771.png"
                    fp = generate_fingerprint(title, company, city)

                    jobs.append({
                        "id": f"vnw-{item.get('jobId', len(jobs))}",
                        "title": title,
                        "company_name": company,
                        "company_logo": logo,
                        "location_city": city,
                        "location_district": "",
                        "address_detail": f"{city}, Việt Nam",
                        "salary_min": min_sal,
                        "salary_max": max_sal,
                        "salary_currency": curr,
                        "salary_raw_text": salary_raw,
                        "description": f"{company} đang tuyển dụng {title}. Chịu trách nhiệm bảo trì hệ thống, quản trị mạng, máy chủ và hỗ trợ kỹ thuật người dùng doanh nghiệp.",
                        "requirements": [
                            f"Kinh nghiệm 1-3 năm ở vị trí {title} hoặc tương đương.",
                            "Am hiểu quản trị hệ thống mạng, hạ tầng máy chủ Windows/Linux.",
                            "Kỹ năng xử lý sự cố nhanh chóng, tinh thần trách nhiệm cao."
                        ],
                        "benefits": [
                            f"Thu nhập: {salary_raw}",
                            "Đầy đủ chế độ bảo hiểm theo quy định pháp luật",
                            "Thưởng hiệu quả công việc, thưởng Lễ Tết và tháng lương 13"
                        ],
                        "skills_tags": extract_skills(title),
                        "job_type": "FULL_TIME",
                        "experience_level": "SENIOR" if "senior" in title.lower() else "MIDDLE",
                        "industry": "Công nghệ thông tin / Hạ tầng IT",
                        "it_subfield": detect_it_subfield(title),
                        "source_platform": "VIETNAMWORKS",
                        "source_url": j_url,
                        "source_job_id": f"VNW-{item.get('jobId', '')}",
                        "fingerprint_hash": fp,
                        "posted_at": now_iso,
                        "crawled_at": now_iso,
                        "expires_at": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=28)).isoformat(),
                        "is_active": True,
                        "is_expired": False,
                        "update_time_text": "Mới cập nhật"
                    })
        except Exception:
            pass
        return jobs

    @staticmethod
    def crawl_careerlink(keyword: str = "it-support") -> List[Dict[str, Any]]:
        """Cào tin trực tiếp 100% link gốc từ CareerLink"""
        jobs = []
        try:
            import urllib.request
            url = f"https://www.careerlink.vn/viec-lam/k/{keyword}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                parts = html.split('<a class="job-link clickable-outside"')
                now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                for p in parts[1:]:
                    m_title = re.search(r'title="([^"]+)"\s+href="(/tim-viec-lam/[^"]+)"', p)
                    if not m_title:
                        continue
                    title = m_title.group(1).strip()
                    if not is_strictly_it_job(title):
                        continue
                    rel_url = m_title.group(2).split("?")[0]
                    full_url = f"https://www.careerlink.vn{rel_url}"

                    m_id = re.search(r'/(\d+)(?:$|\?)', rel_url)
                    job_id_num = m_id.group(1) if m_id else str(len(jobs))

                    m_comp = re.search(r'class="[^"]*job-company[^"]*"\s+title="([^"]+)"', p)
                    company = m_comp.group(1).strip() if m_comp else "Doanh nghiệp IT"

                    m_city = re.search(r'href="/tim-viec-lam-tai/[^"]+">([^<]+)</a>', p)
                    city = m_city.group(1).strip() if m_city else "Hà Nội"
                    if "Hồ Chí Minh" in city or "TP HCM" in city:
                        city = "Hồ Chí Minh"

                    m_sal = re.search(r"class='job-salary[^']*'>([\s\S]*?)</span>", p)
                    salary_raw = m_sal.group(1).strip() if m_sal else "Thương lượng"
                    min_sal, max_sal, curr = parse_salary_range(salary_raw)

                    m_logo = re.search(r'class="logo-img[^"]*"\s+src="([^"]+)"', p)
                    logo = m_logo.group(1) if m_logo else "https://cdn-icons-png.flaticon.com/512/1006/1006771.png"
                    fp = generate_fingerprint(title, company, city)

                    jobs.append({
                        "id": f"cl-{job_id_num}",
                        "title": title,
                        "company_name": company,
                        "company_logo": logo,
                        "location_city": city,
                        "location_district": "",
                        "address_detail": f"{city}, Việt Nam",
                        "salary_min": min_sal,
                        "salary_max": max_sal,
                        "salary_currency": curr,
                        "salary_raw_text": salary_raw,
                        "description": f"{company} tuyển dụng {title}. Quản lý hệ thống máy trạm, mạng LAN nội bộ, máy chủ và ứng dụng hỗ trợ người dùng.",
                        "requirements": [
                            f"Kinh nghiệm 1-2 năm vị trí {title} hoặc tương tự.",
                            "Có kiến thức thực tế về cài đặt máy tính, xử lý mạng, máy in, phần mềm văn phòng.",
                            "Nhiệt tình, chu đáo và chịu khó học hỏi."
                        ],
                        "benefits": [
                            f"Mức lương: {salary_raw}",
                            "Chế độ BHXH, BHYT theo luật hiện hành",
                            "Môi trường làm việc thân thiện, có cơ hội đào tạo kỹ năng"
                        ],
                        "skills_tags": extract_skills(title),
                        "job_type": "FULL_TIME",
                        "experience_level": "SENIOR" if "senior" in title.lower() else "MIDDLE",
                        "industry": "Công nghệ thông tin / IT Helpdesk",
                        "it_subfield": detect_it_subfield(title),
                        "source_platform": "CAREERLINK",
                        "source_url": full_url,
                        "source_job_id": f"CL-{job_id_num}",
                        "fingerprint_hash": fp,
                        "posted_at": now_iso,
                        "crawled_at": now_iso,
                        "expires_at": (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=28)).isoformat(),
                        "is_active": True,
                        "is_expired": False,
                        "update_time_text": "Mới cập nhật"
                    })
        except Exception:
            pass
        return jobs

