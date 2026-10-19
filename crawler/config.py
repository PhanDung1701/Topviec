"""
TopViec Crawler Configuration & Filtering Rules
Tập trung 100% nhóm ngành IT (IT Support, Helpdesk, System, Network, Admin, Security, Infrastructure)
"""

import hashlib
import unicodedata
import re
from typing import List, Dict, Optional

TARGET_KEYWORDS = [
    'it support',
    'helpdesk',
    'system admin',
    'system engineer',
    'system',
    'hệ thống',
    'network',
    'mạng',
    'sysadmin',
    'administrator',
    'nhân viên it',
    'chuyên viên it',
    'kỹ sư it',
    'trưởng phòng it',
    'it officer',
    'it executive',
    'it specialist',
    'it helpdesk',
    'it technician',
    'kỹ thuật it',
    'hỗ trợ kỹ thuật it',
    'it infrastructure',
    'hạ tầng it',
    'an ninh mạng',
    'bảo mật mạng',
    'quản trị mạng',
    'quản trị hệ thống',
    'kỹ sư mạng',
    'devops',
    'cloud',
    'it'
]

NON_IT_DISQUALIFIERS = [
    'tuyển dụng', 'nhân sự', 'headhunter', 'recruiter', 'talent acquisition',
    'kế toán', 'thu ngân', 'kiểm toán', 'telesale', 'bán hàng', 'kinh doanh',
    'bất động sản', 'bảo hiểm', 'marketing', 'seo content', 'copywriter',
    'lễ tân', 'lái xe', 'tạp vụ', 'bảo vệ', 'phục vụ',
    'hành chính văn phòng', 'hành chính nhân sự', 'phiên dịch', 'giáo viên', 'trợ giảng',
    'hvac', 'chiller', 'cooling', 'cơ điện', 'mep', 'xây dựng', 'thủy lợi', 'công trình', 'điện nước', 'shopdrawing', 'nội thất',
    'mạng xã hội', 'social media', 'truyền thông', 'tiktok', 'facebook', 'content'
]

def remove_vietnamese_tones(text: str) -> str:
    """Loại bỏ dấu tiếng Việt để chuẩn hóa chuỗi"""
    if not text:
        return ""
    normalized = unicodedata.normalize('NFD', text)
    without_marks = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return without_marks.replace('đ', 'd').replace('Đ', 'D')

def is_strictly_it_job(title: str) -> bool:
    """Kiểm tra nghiêm ngặt tiêu đề có thuộc nhóm ngành IT không"""
    if not title:
        return False
    t = title.lower()

    for dis in NON_IT_DISQUALIFIERS:
        if dis in t:
            return False

    for kw in TARGET_KEYWORDS:
        if kw == 'it':
            if re.search(r'\b(it|cntt)\b', t, re.IGNORECASE):
                return True
        else:
            if kw in t:
                return True

    return False

def generate_fingerprint(title: str, company: str, city: str) -> str:
    """Tạo mã băm MD5 duy nhất để nhận diện và gộp tin trùng lặp giữa các sàn"""
    norm_title = re.sub(r'[^a-z0-9]', '', remove_vietnamese_tones(title or '').lower())
    norm_company = re.sub(r'[^a-z0-9]', '', remove_vietnamese_tones(company or '').lower())
    norm_city = re.sub(r'[^a-z0-9]', '', remove_vietnamese_tones(city or '').lower())
    combined = f"{norm_title}_{norm_company}_{norm_city}"
    return hashlib.md5(combined.encode('utf-8')).hexdigest()

def detect_it_subfield(title: str) -> str:
    """Phân loại chuyên sâu phân nhóm IT"""
    t = title.lower()
    if any(k in t for k in ['security', 'an ninh', 'bảo mật', 'soc']):
        return 'SECURITY_AN_NINH'
    if any(k in t for k in ['network', 'mạng', 'hạ tầng', 'cisco']):
        return 'NETWORK_ENGINEER'
    if any(k in t for k in ['system', 'hệ thống', 'admin', 'sysadmin', 'server']):
        return 'SYSTEM_ADMIN'
    if any(k in t for k in ['support', 'helpdesk', 'kỹ thuật it', 'nhân viên it', 'desktop']):
        return 'IT_SUPPORT_HELPDESK'
    if any(k in t for k in ['devops', 'cloud', 'aws', 'azure', 'kubernetes', 'docker']):
        return 'DEVOPS_CLOUD'
    if any(k in t for k in ['frontend', 'react', 'vue', 'angular']):
        return 'FRONTEND'
    if any(k in t for k in ['backend', 'node', 'java', 'python', 'golang', '.net']):
        return 'BACKEND'
    if any(k in t for k in ['fullstack']):
        return 'FULLSTACK'
    if any(k in t for k in ['tester', 'qa', 'qc', 'kiem thu']):
        return 'QA_TESTER'
    if any(k in t for k in ['ai', 'data', 'machine learning', 'nlp']):
        return 'AI_DATA'
    return 'IT_SUPPORT_HELPDESK'

def extract_skills(title: str) -> List[str]:
    """Trích xuất danh sách kỹ năng liên quan từ tiêu đề"""
    t = title.lower()
    skills = []
    if any(k in t for k in ['support', 'helpdesk']):
        skills.extend(['IT Support', 'Helpdesk Support', 'Troubleshooting'])
    if any(k in t for k in ['system', 'hệ thống']):
        skills.extend(['System Admin', 'Windows Server', 'Linux'])
    if any(k in t for k in ['network', 'mạng']):
        skills.extend(['Network Engineer', 'Cisco', 'Routing & Switching', 'LAN/WAN'])
    if any(k in t for k in ['security', 'an ninh', 'bảo mật']):
        skills.extend(['Network Security', 'Firewall', 'SOC'])
    if any(k in t for k in ['devops', 'cloud']):
        skills.extend(['DevOps', 'Docker', 'Cloud Infrastructure'])
    if not skills:
        skills.extend(['IT Support', 'System Admin', 'Networking'])
    return list(dict.fromkeys(skills))

def sanitize_query(title: str, company: str = "") -> str:
    """Làm sạch từ khóa tìm kiếm, loại bỏ ký tự nguy hiểm gây lỗi 404"""
    t = re.sub(r"\([^)]*\)", " ", title or "")
    t = re.sub(r"\[[^\]]*\]", " ", t)
    t = re.sub(r"[\\/|:;*+?^${}=\"!@#%~`,._&]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    c = re.sub(r"\([^)]*\)", " ", company or "")
    c = re.sub(r"\[[^\]]*\]", " ", c)
    c = re.sub(r"công ty|tnhh|cổ phần|cp|tập đoàn|corporation|solution|vietnam", " ", c, flags=re.IGNORECASE)
    c = re.sub(r"[\\/|:;*+?^${}=\"!@#%~`,._&]", " ", c)
    c = re.sub(r"\s+", " ", c).strip()

    res = f"{t} {c}".strip()
    return re.sub(r"\s+", " ", res) or "IT Support"

def get_platform_search_url(platform: str, title: str, company: str = "") -> str:
    """Tạo URL tìm kiếm chuẩn xác 100% không bị 404 cho từng sàn tuyển dụng"""
    q = sanitize_query(title, company)
    encoded_q = "+".join(q.split())

    if platform == "JOBOKO":
        return f"https://vn.joboko.com/tim-viec-lam?q={encoded_q}"
    elif platform == "VIETNAMWORKS":
        return f"https://www.vietnamworks.com/viec-lam?q={encoded_q}"
    elif platform == "TOPCV":
        return f"https://www.topcv.vn/tim-viec-lam-moi-nhat?keyword={encoded_q}"
    elif platform == "CAREERVIET":
        normalized = remove_vietnamese_tones(title or "IT Support").lower()
        slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-") or "it-support"
        return f"https://careerviet.vn/viec-lam/{slug}-k-vi.html"
    elif platform == "VIECLAM24H":
        return f"https://vieclam24h.vn/tim-kiem-viec-lam-nhanh?keyword={encoded_q}"
    elif platform == "JOBSGO":
        return f"https://jobsgo.vn/viec-lam.html?keyword={encoded_q}"
    elif platform == "CAREERLINK":
        return f"https://www.careerlink.vn/tim-viec-lam-nhanh?keyword={encoded_q}"
    elif platform == "INDEED":
        return f"https://vn.indeed.com/jobs?q={encoded_q}"
    return f"https://www.google.com/search?q={encoded_q}"
