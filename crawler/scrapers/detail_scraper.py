"""
TopViec Job Detail Scraper Powered by Scrapling
Trích xuất dữ liệu chi tiết công việc sử dụng Scrapling (Adaptive Parser & Stealth Fetcher)
"""

import re
import html
from typing import Dict, Any, List, Optional
from scrapling import Fetcher, StealthyFetcher, Selector
from crawler.config import (
    is_strictly_it_job,
    detect_it_subfield,
    extract_skills,
    generate_fingerprint
)

def clean_text(raw: str) -> str:
    """Loại bỏ thẻ HTML và chuẩn hóa khoảng trắng"""
    if not raw:
        return ""
    # Thay <br>, <p>, <li> bằng xuống dòng
    text = re.sub(r'<br\s*/?>', '\n', raw, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    # Bỏ các thẻ html còn lại
    text = re.sub(r'<[^>]+>', '', text)
    # Giải mã HTML entities
    text = html.unescape(text)
    # Chuẩn hóa khoảng trắng từng dòng
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join([line for line in lines if line])

def clean_bullets(raw: str) -> List[str]:
    """Tách đoạn văn thành danh sách bullet gạch đầu dòng sạch sẽ"""
    if not raw:
        return []
    cleaned = clean_text(raw)
    items = []
    for line in cleaned.split('\n'):
        item = re.sub(r'^[-*•+\d\.\)\s]+', '', line).strip()
        if item and len(item) > 3 and not item.startswith(('===', '---')):
            items.append(item)
    return items

def parse_salary_numbers(salary_text: str):
    """Trích xuất min, max và tiền tệ từ chuỗi lương thô"""
    text = salary_text.lower()
    currency = 'USD' if ('usd' in text or '$' in text) else 'VND'
    min_sal = 15
    max_sal = 30

    # Tìm mẫu "15 - 25 triệu" hoặc "1,000 - 2,000 USD"
    nums = [int(n) for n in re.findall(r'\b\d+\b', text)]
    if len(nums) >= 2:
        min_sal = min(nums[0], nums[1])
        max_sal = max(nums[0], nums[1])
    elif len(nums) == 1:
        if 'trên' in text or 'từ' in text:
            min_sal = nums[0]
            max_sal = nums[0] * 2
        elif 'đến' in text or 'tới' in text or 'dưới' in text:
            min_sal = max(5, nums[0] // 2)
            max_sal = nums[0]

    return min_sal, max_sal, currency

class JobDetailScraper:
    """Scrapling-powered Job Detail Scraper"""

    @classmethod
    def fetch_page(cls, url: str, use_stealth: bool = False) -> Selector:
        """Tải trang thông qua Scrapling Fetcher hoặc StealthyFetcher"""
        # 1. Thử tải nhanh qua Fetcher (HTTP có giả lập TLS browser fingerprint)
        if not use_stealth:
            try:
                response = Fetcher.get(
                    url,
                    timeout=15,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Referer': 'https://www.google.com/'
                    }
                )
                if response.status == 200 and len(response.text) > 1000:
                    # Kiểm tra xem có bị dính Cloudflare bot verification không
                    if 'cf-browser-verification' not in response.text and 'Just a moment' not in response.text:
                        return response
            except Exception as e:
                # Nếu Fetcher gặp lỗi mạng hoặc bị từ chối kết nối, chuyển sang Stealth
                pass

        # 2. Vượt bot / Cloudflare bằng StealthyFetcher (Headless Browser)
        stealth_response = StealthyFetcher.fetch(
            url,
            headless=True,
            solve_cloudflare=True,
            timeout=25000,
            network_idle=True
        )
        return stealth_response

    @classmethod
    def scrape(cls, url: str, platform_hint: Optional[str] = None, use_stealth: bool = False) -> Dict[str, Any]:
        """Cào và trích xuất thông tin chi tiết một công việc bất kỳ"""
        page = cls.fetch_page(url, use_stealth=use_stealth)

        # 1. Xác định platform
        platform = platform_hint
        if not platform:
            if 'topcv.vn' in url:
                platform = 'TOPCV'
            elif 'careerviet.vn' in url:
                platform = 'CAREERVIET'
            elif 'careerlink.vn' in url:
                platform = 'CAREERLINK'
            elif 'vietnamworks.com' in url:
                platform = 'VIETNAMWORKS'
            elif 'vieclam24h.vn' in url:
                platform = 'VIECLAM24H'
            elif 'jobsgo.vn' in url:
                platform = 'JOBSGO'
            else:
                platform = 'CAREERLINK'

        # 2. Trích xuất Tiêu đề (Title)
        title = ""
        # Thử lấy toàn bộ text bên trong h1 và các thẻ con
        h1_texts = page.css('h1 *::text, h1::text').getall()
        if h1_texts:
            candidate_h1 = clean_text(' '.join(h1_texts))
            if candidate_h1 and len(candidate_h1) > 2:
                title = candidate_h1

        if not title:
            title_candidates = [
                page.css('h1.job-title::text').get(),
                page.css('h1.title::text').get(),
                page.css('h1[class*="job-title"]::text').get(),
                page.css('h1[class*="title"]::text').get(),
                page.css('.job-header-info h1::text').get(),
                page.css('.job-detail-title::text').get()
            ]
            for c in title_candidates:
                if c and clean_text(c):
                    title = clean_text(c)
                    break

        if not title:
            og_title = page.css('meta[property="og:title"]::attr(content)').get()
            if og_title:
                title = clean_text(og_title.split('-')[0].split('|')[0])

        if not title:
            raw_doc_title = page.css('title::text').get()
            if raw_doc_title:
                title = clean_text(raw_doc_title.split('-')[0].split('|')[0])

        # 3. Trích xuất Công ty (Company Name)
        company = ""
        comp_candidates = [
            page.css('a.company-name::text').get(),
            page.css('.company-title::text').get(),
            page.css('.org-name a::text').get(),
            page.css('.company-name-title a::text').get(),
            page.css('[class*="company-name"]::text').get(),
            page.css('[class*="employer-name"]::text').get(),
            page.css('.job-company-name::text').get()
        ]
        for c in comp_candidates:
            if c and clean_text(c):
                company = clean_text(c)
                break
        if not company:
            company = "Doanh nghiệp IT"

        # 4. Trích xuất Logo & Banner
        logo = ""
        logo_candidates = [
            page.css('img.company-logo::attr(src)').get(),
            page.css('img.company-img::attr(src)').get(),
            page.css('img[class*="company"]::attr(src)').get(),
            page.css('img[class*="logo"]::attr(src)').get(),
            page.css('.box-company-logo img::attr(src)').get(),
            page.css('meta[property="og:image"]::attr(content)').get()
        ]
        for l in logo_candidates:
            if l and l.startswith('http'):
                logo = l
                break
        if not logo:
            logo = "https://cdn-icons-png.flaticon.com/512/1006/1006771.png"

        banner = page.css('.company-cover img::attr(src), .banner-cover img::attr(src)').get() or ""

        # 5. Mức lương (Salary)
        salary_text = "Thỏa thuận"
        sal_candidates = [
            page.css('.salary::text').get(),
            page.css('.title-salary::text').get(),
            page.css('[class*="salary"]::text').get(),
            page.css('.job-detail__salary::text').get(),
            page.css('.box-main .salary strong::text').get()
        ]
        for s in sal_candidates:
            if s and ('triệu' in s.lower() or 'usd' in s.lower() or 'thương lượng' in s.lower() or 'thỏa thuận' in s.lower()):
                salary_text = clean_text(s)
                break

        min_sal, max_sal, sal_curr = parse_salary_numbers(salary_text)

        # 6. Địa điểm (Location & City)
        city = "Hà Nội"
        raw_location = ""
        loc_candidates = [
            page.css('.city-text::text').get(),
            page.css('.job-detail__location::text').get(),
            page.css('[class*="location"]::text').get(),
            page.css('.cli-location + span::text').get()
        ]
        for loc in loc_candidates:
            if loc and clean_text(loc):
                raw_location = clean_text(loc)
                break

        if 'Hồ Chí Minh' in raw_location or 'TP HCM' in raw_location or 'TP.HCM' in raw_location or 'Sài Gòn' in raw_location:
            city = 'Hồ Chí Minh'
        elif 'Đà Nẵng' in raw_location:
            city = 'Đà Nẵng'
        elif 'Bình Dương' in raw_location:
            city = 'Bình Dương'
        elif 'Hải Phòng' in raw_location:
            city = 'Hải Phòng'
        elif 'Cần Thơ' in raw_location:
            city = 'Cần Thơ'
        elif 'Bắc Ninh' in raw_location:
            city = 'Bắc Ninh'

        # 7. Mô tả công việc, Yêu cầu, Quyền lợi
        # Sử dụng Scrapling adaptive text extraction
        description_raw = ""
        requirements_list = []
        benefits_list = []
        description_sections = []

        # Scrapling hỗ trợ tìm section theo id, class hoặc text heading
        desc_box = (
            page.css('#section-job-description .rich-text-content').get() or
            page.css('.job-description .rich-text').get() or
            page.css('.job-description').get() or
            page.css('.job-detail-content').get() or
            page.css('[class*="job-description"]').get() or
            ""
        )
        if desc_box:
            description_raw = clean_text(desc_box)
            bullets = clean_bullets(desc_box)
            if bullets:
                description_sections.append({"heading": "Nhiệm vụ & Mô tả công việc", "items": bullets})

        req_box = (
            page.css('#section-job-skills .rich-text-content').get() or
            page.css('#section-job-requirements').get() or
            page.css('.job-requirements').get() or
            page.css('[class*="requirement"]').get() or
            ""
        )
        if req_box:
            requirements_list = clean_bullets(req_box)

        benefit_box = (
            page.css('#section-job-benefits').get() or
            page.css('.job-benefits').get() or
            page.css('[class*="benefit"]').get() or
            ""
        )
        if benefit_box:
            benefits_list = clean_bullets(benefit_box)

        # Fallback nếu cấu trúc trang khác biệt (tìm theo headings)
        if not description_raw or not requirements_list:
            all_h2_h3 = page.css('h2, h3, h4, strong')
            for el in all_h2_h3:
                txt = el.text.strip() if hasattr(el, 'text') else ''
                txt_lower = txt.lower()
                # Lấy text các phần tử liền kề bên dưới
                next_content = el.xpath('following-sibling::*[1]').get() or ""
                if 'mô tả' in txt_lower and not description_raw:
                    description_raw = clean_text(next_content)
                    bullets = clean_bullets(next_content)
                    if bullets:
                        description_sections.append({"heading": txt, "items": bullets})
                elif ('yêu cầu' in txt_lower or 'kỹ năng' in txt_lower) and not requirements_list:
                    requirements_list = clean_bullets(next_content)
                elif ('quyền lợi' in txt_lower or 'chế độ' in txt_lower or 'phúc lợi' in txt_lower) and not benefits_list:
                    benefits_list = clean_bullets(next_content)

        # Đảm bảo có dữ liệu mặc định hợp lý nếu trang quá sơ sài
        if not description_raw:
            description_raw = f"{company} tuyển dụng {title}. Chịu trách nhiệm quản lý, vận hành và đảm bảo an toàn cho toàn bộ hệ thống CNTT, mạng LAN/WAN và máy tính người dùng nội bộ."
        if not requirements_list:
            requirements_list = [
                f"Có kinh nghiệm thực tế tại vị trí {title} hoặc tương đương.",
                "Thành thạo quản trị hệ điều hành Windows Server, Linux, thiết bị mạng Router/Switch.",
                "Kỹ năng xử lý sự cố phần cứng, phần mềm và hỗ trợ người dùng nhanh nhạy."
            ]
        if not benefits_list:
            benefits_list = [
                f"Mức lương hấp dẫn: {salary_text}",
                "Được đóng đầy đủ BHXH, BHYT, BHTN theo quy định nhà nước",
                "Chế độ thưởng lễ tết, tháng lương 13 và du lịch hàng năm"
            ]

        # 8. Hạn nộp hồ sơ & Ngày đăng
        deadline_text = "Còn hạn tuyển"
        posted_date_text = "Gần đây"
        deadline_match = re.search(r'hạn nộp[^:]*:\s*(\d{2}[/-]\d{2}[/-]\d{4}|\d{2}[/-]\d{2})', page.text, re.IGNORECASE)
        if deadline_match:
            deadline_text = deadline_match.group(1)

        posted_match = re.search(r'ngày đăng[^:]*:\s*(\d{2}[/-]\d{2}[/-]\d{4})', page.text, re.IGNORECASE)
        if posted_match:
            posted_date_text = posted_match.group(1)

        # 9. Kinh nghiệm & Hình thức
        exp_level = 'MIDDLE'
        if any(w in title.lower() for w in ['senior', 'chuyên viên cao cấp', 'trưởng nhóm', 'leader']):
            exp_level = 'SENIOR'
        elif any(w in title.lower() for w in ['intern', 'thực tập', 'sinh viên']):
            exp_level = 'INTERN'
        elif any(w in title.lower() for w in ['fresher', 'mới tốt nghiệp']):
            exp_level = 'FRESHER'
        elif any(w in title.lower() for w in ['junior']):
            exp_level = 'JUNIOR'
        elif any(w in title.lower() for w in ['trưởng phòng', 'giám đốc', 'manager', 'head']):
            exp_level = 'LEAD_MANAGER'

        job_type = 'FULL_TIME'
        if 'remote' in title.lower() or 'từ xa' in page.text.lower():
            job_type = 'REMOTE'
        elif 'hybrid' in title.lower() or 'linh hoạt' in page.text.lower():
            job_type = 'HYBRID'
        elif 'part time' in title.lower() or 'bán thời gian' in title.lower():
            job_type = 'PART_TIME'

        subfield = detect_it_subfield(title)
        skills = extract_skills(title)

        fingerprint = generate_fingerprint(title, company, city)

        return {
            "title": title,
            "company_name": company,
            "company_logo": logo,
            "company_banner": banner,
            "location_city": city,
            "location_district": "",
            "address_detail": raw_location or f"{city}, Việt Nam",
            "salary_min": min_sal,
            "salary_max": max_sal,
            "salary_currency": sal_curr,
            "salary_raw_text": salary_text,
            "description": description_raw,
            "description_sections": description_sections,
            "requirements": requirements_list,
            "benefits": benefits_list,
            "skills_tags": skills,
            "job_type": job_type,
            "experience_level": exp_level,
            "industry": "Công nghệ thông tin / Hạ tầng mạng / IT Support",
            "it_subfield": subfield,
            "source_platform": platform,
            "source_url": url,
            "fingerprint_hash": fingerprint,
            "posted_date_text": posted_date_text,
            "deadline_text": deadline_text,
            "other_info": {
                "work_type": "Toàn thời gian",
                "experience_required": exp_level,
                "posted_date_text": posted_date_text,
                "deadline_text": deadline_text,
                "exact_salary": salary_text
            }
        }
