import json
import re
import unicodedata
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def to_ascii_slug(text: str) -> str:
    if not text:
        return "it"
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "D")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "it"

def sanitize_query(title: str, company: str = "") -> str:
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

def get_clean_url(platform: str, title: str, company: str, existing_url: str) -> str:
    # Nếu là link trực tiếp chi tiết bài đăng (có slug, id thật của bài đăng), giữ nguyên
    if existing_url and not any(k in existing_url for k in ['?q=', '&q=', 'keyword=', 'tim-kiem']):
        if 'topcv.vn/viec-lam/' in existing_url or 'topcv.vn/brand/' in existing_url:
            return existing_url
        if 'careerviet.vn/vi/tim-viec-lam/' in existing_url:
            return existing_url
        if 'careerlink.vn/tim-viec-lam/' in existing_url:
            return existing_url

    q = sanitize_query(title, company)
    encoded_q = "+".join(q.split())

    if platform == "JOBOKO":
        return f"https://vn.joboko.com/tim-viec-lam?q={encoded_q}"
    elif platform == "VIETNAMWORKS":
        return f"https://www.vietnamworks.com/viec-lam?q={encoded_q}"
    elif platform == "TOPCV":
        return f"https://www.topcv.vn/tim-viec-lam-moi-nhat?keyword={encoded_q}"
    elif platform == "CAREERVIET":
        slug = to_ascii_slug(title or "IT Support")
        return f"https://careerviet.vn/viec-lam/{slug}-k-vi.html"
    elif platform == "VIECLAM24H":
        return f"https://vieclam24h.vn/tim-kiem-viec-lam-nhanh?keyword={encoded_q}"
    elif platform == "JOBSGO":
        return f"https://jobsgo.vn/viec-lam.html?keyword={encoded_q}"
    elif platform == "CAREERLINK":
        return f"https://www.careerlink.vn/tim-viec-lam-nhanh?keyword={encoded_q}"
    elif platform == "INDEED":
        return f"https://vn.indeed.com/jobs?q={encoded_q}"
    return existing_url

def main():
    target_file = ROOT_DIR / "src" / "data" / "mockJobs.ts"
    backup_file = ROOT_DIR / "crawler" / "jobs_backup.json"

    content = target_file.read_text(encoding="utf-8")
    eq_pos = content.find("= [")
    json_start = content.find("[", eq_pos)
    json_end = content.rfind("]")
    jobs = json.loads(content[json_start:json_end+1])

    fixed_count = 0
    for j in jobs:
        old_url = j.get("source_url", "")
        new_url = get_clean_url(
            j.get("source_platform", ""),
            j.get("title", ""),
            j.get("company_name", ""),
            old_url
        )
        if new_url != old_url:
            j["source_url"] = new_url
            fixed_count += 1

    print(f"Total jobs: {len(jobs)}")
    print(f"Fixed {fixed_count} URLs.")

    # Write back to mockJobs.ts
    header = content[:json_start]
    footer = content[json_end+1:]
    new_content = header + json.dumps(jobs, ensure_ascii=False, indent=2) + footer
    target_file.write_text(new_content, encoding="utf-8")

    # Write to backup
    backup_file.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Updated src/data/mockJobs.ts and crawler/jobs_backup.json!")

if __name__ == "__main__":
    main()
