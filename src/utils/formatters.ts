import { ExperienceLevel, ITSubfield, JobListing, JobType } from "@/types/job";

export function removeVietnameseTones(str: string): string {
  let text = str;
  text = text.toLowerCase();
  text = text.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  text = text.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  text = text.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  text = text.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  text = text.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  text = text.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  text = text.replace(/đ/g, "d");
  text = text.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  text = text.replace(/\u02C6|\u0306|\u031B/g, "");
  return text;
}

export function generateFingerprint(title: string, company: string, city: string): string {
  const normTitle = removeVietnameseTones(title)
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  const normCompany = removeVietnameseTones(company)
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  const normCity = removeVietnameseTones(city)
    .replace(/[^a-z0-9]/g, "");

  // Simple string hash
  let hash = 0;
  const combined = `${normTitle}::${normCompany}::${normCity}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(16)}_${normTitle.slice(0, 8)}`;
}

export function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return "15 phút trước";
  if (typeof window === "undefined") {
    return "15 phút trước";
  }
  try {
    const date = new Date(isoDate);
    const nowMs = Date.now();
    const diffMs = Math.max(0, nowMs - date.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Vừa cập nhật";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 7)} tuần trước`;
  } catch {
    return "15 phút trước";
  }
}

export function formatSalary(rawText: string, min: number, max: number, currency: "VND" | "USD"): string {
  if (rawText) return rawText;
  if (currency === "USD") {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `Từ $${min.toLocaleString()}`;
    return "Lương USD thỏa thuận";
  }
  if (min > 0 && max > 0) {
    return `${min} - ${max} triệu`;
  }
  if (min > 0) return `Từ ${min} triệu`;
  if (max > 0) return `Đến ${max} triệu`;
  return "Thỏa thuận";
}

export const VIETNAM_LOCATIONS = [
  {
    city: "Toàn quốc",
    districts: ["Tất cả địa điểm"],
  },
  {
    city: "Hà Nội",
    districts: [
      "Tất cả quận/huyện",
      "Cầu Giấy",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Đống Đa",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Thanh Xuân",
      "Ba Đình",
      "Hoàng Mai",
      "Long Biên",
      "Hà Đông",
      "Tây Hồ",
    ],
  },
  {
    city: "Hồ Chí Minh",
    districts: [
      "Tất cả quận/huyện",
      "Quận 1",
      "Quận 3",
      "Quận 7",
      "Quận 10",
      "Bình Thạnh",
      "Phú Nhuận",
      "Tân Bình",
      "TP. Thủ Đức",
      "Gò Vấp",
      "Quận 5",
      "Tân Phú",
    ],
  },
  {
    city: "Thanh Hóa",
    districts: [
      "Tất cả quận/huyện",
      "TP. Thanh Hóa",
      "Sầm Sơn",
      "Bỉm Sơn",
      "Nghi Sơn",
      "Đông Sơn",
      "Quảng Xương",
      "Hoằng Hóa",
      "Hà Trung",
      "Thọ Xuân",
      "Yên Định",
      "Triệu Sơn",
      "Nông Cống",
    ],
  },
  {
    city: "Đà Nẵng",
    districts: [
      "Tất cả quận/huyện",
      "Hải Châu",
      "Thanh Khê",
      "Sơn Trà",
      "Ngũ Hành Sơn",
      "Cẩm Lệ",
      "Liên Chiểu",
    ],
  },
  {
    city: "Bình Dương",
    districts: ["Tất cả quận/huyện", "Thủ Dầu Một", "Thuận An", "Dĩ An", "Bến Cát", "Tân Uyên"],
  },
  {
    city: "Cần Thơ",
    districts: ["Tất cả quận/huyện", "Ninh Kiều", "Bình Thủy", "Cái Răng"],
  },
  {
    city: "Hải Phòng",
    districts: ["Tất cả quận/huyện", "Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An"],
  },
];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  INTERN: "Thực tập sinh",
  FRESHER: "Fresher / Mới tốt nghiệp",
  JUNIOR: "Junior (1 - 2 năm)",
  MIDDLE: "Middle (2 - 4 năm)",
  SENIOR: "Senior (5+ năm)",
  LEAD_MANAGER: "Trưởng nhóm / Quản lý",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  REMOTE: "Làm từ xa (Remote)",
  HYBRID: "Kết hợp (Hybrid)",
  CONTRACT: "Dự án / Thời vụ",
};

export const IT_SUBFIELD_LABELS: Record<ITSubfield, string> = {
  ALL: "Tất cả chuyên ngành IT",
  IT_SUPPORT_HELPDESK: "IT Support & Helpdesk",
  SYSTEM_ADMIN: "Quản trị hệ thống (System Admin)",
  NETWORK_ENGINEER: "Quản trị mạng (Network Engineer)",
  NETWORK_SYSTEM: "Quản trị mạng & Hệ thống (Network / System)",
  SECURITY_AN_NINH: "An ninh mạng & Bảo mật (Security)",
  INFRASTRUCTURE_CLOUD: "Hạ tầng IT & Cloud / Máy chủ",
  IT_MANAGEMENT: "Trưởng phòng & Quản lý IT (IT Manager)",
  DEVOPS_CLOUD: "Hạ tầng IT & Cloud / DevOps",
  SECURITY: "An ninh mạng & Bảo mật",
  FRONTEND: "Lập trình Frontend",
  BACKEND: "Lập trình Backend",
  FULLSTACK: "Lập trình Full-stack",
  MOBILE: "Lập trình Di động",
  AI_DATA: "Trí tuệ nhân tạo (AI / Data)",
  QA_TESTER: "Kiểm thử phần mềm (QA / QC)",
  PM_BA_PRODUCT: "Quản lý dự án CNTT (PM / BA)",
};

export function formatDaysRemaining(expiresAt: string, isExpired?: boolean): { label: string; isUrgent: boolean; isExpired: boolean } {
  if (isExpired) {
    return { label: "Đã hết hạn", isUrgent: false, isExpired: true };
  }
  if (!expiresAt) {
    return { label: "Đang mở tuyển", isUrgent: false, isExpired: false };
  }
  try {
    const expDate = new Date(expiresAt).getTime();
    const now = typeof window !== "undefined" ? Date.now() : 1776312000000;
    const diffMs = expDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: "Hết hạn hôm nay", isUrgent: true, isExpired: true };
    }
    if (diffDays === 1) {
      return { label: "Hạn chót: Còn 1 ngày", isUrgent: true, isExpired: false };
    }
    if (diffDays <= 5) {
      return { label: `Còn ${diffDays} ngày ứng tuyển`, isUrgent: true, isExpired: false };
    }
    return { label: `Hạn nộp: Còn ${diffDays} ngày`, isUrgent: false, isExpired: false };
  } catch {
    return { label: "Đang mở tuyển", isUrgent: false, isExpired: false };
  }
}

export function isJobValidWithinMonth(job: JobListing, referenceTime?: number): boolean {
  if (job.is_expired || !job.is_active) {
    return false;
  }
  const now = referenceTime || (typeof window !== "undefined" ? Date.now() : 1776312000000);
  
  // Expiration check
  if (job.expires_at) {
    const expTime = new Date(job.expires_at).getTime();
    if (expTime < now) {
      return false; // Expired
    }
  }

  // 1 month freshness check (<= 30 days)
  if (job.posted_at) {
    const postTime = new Date(job.posted_at).getTime();
    const diffDays = (now - postTime) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      return false; // Older than 1 month
    }
  }

  return true;
}
