import { PlatformSource } from "@/types/job";

export interface PlatformConfig {
  key: PlatformSource;
  name: string;
  shortName: string;
  tagline: string;
  brandColor: string; // Tailwind or Hex
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  logoLetter: string;
  domain: string;
}

export const PLATFORM_CONFIGS: Record<PlatformSource, PlatformConfig> = {
  TOPCV: {
    key: "TOPCV",
    name: "TopCV",
    shortName: "TopCV",
    tagline: "Tiếp lợi thế - Nối thành công",
    brandColor: "#00b14f",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-300 dark:border-emerald-800",
    badgeBg: "bg-emerald-600",
    badgeText: "text-white",
    logoLetter: "TCV",
    domain: "topcv.vn",
  },
  VIETNAMWORKS: {
    key: "VIETNAMWORKS",
    name: "VietnamWorks",
    shortName: "VNWorks",
    tagline: "Move Up - Navigating Dreams",
    brandColor: "#f36f21",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-300 dark:border-orange-800",
    badgeBg: "bg-orange-500",
    badgeText: "text-white",
    logoLetter: "VNW",
    domain: "vietnamworks.com",
  },
  VIECLAM24H: {
    key: "VIECLAM24H",
    name: "Vieclam24h",
    shortName: "Viec24h",
    tagline: "Việc làm phổ thông & Chuyên nghiệp",
    brandColor: "#7c3aed",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-300 dark:border-purple-800",
    badgeBg: "bg-purple-600",
    badgeText: "text-white",
    logoLetter: "V24",
    domain: "vieclam24h.vn",
  },
  CAREERVIET: {
    key: "CAREERVIET",
    name: "CareerViet",
    shortName: "CareerViet",
    tagline: "Success with CareerBuilder Network",
    brandColor: "#00457c",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    textColor: "text-sky-800 dark:text-sky-300",
    borderColor: "border-sky-300 dark:border-sky-800",
    badgeBg: "bg-sky-800",
    badgeText: "text-white",
    logoLetter: "CVT",
    domain: "careerviet.vn",
  },
  JOBSGO: {
    key: "JOBSGO",
    name: "JobsGO",
    shortName: "JobsGO",
    tagline: "Tìm việc nhanh trên Mobile & Web",
    brandColor: "#0284c7",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-800",
    badgeBg: "bg-blue-600",
    badgeText: "text-white",
    logoLetter: "JGO",
    domain: "jobsgo.vn",
  },
  CAREERLINK: {
    key: "CAREERLINK",
    name: "CareerLink",
    shortName: "CareerLink",
    tagline: "Cầu nối nghề nghiệp vững chắc",
    brandColor: "#dc2626",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    textColor: "text-rose-700 dark:text-rose-400",
    borderColor: "border-rose-300 dark:border-rose-800",
    badgeBg: "bg-rose-600",
    badgeText: "text-white",
    logoLetter: "CLK",
    domain: "careerlink.vn",
  },
  JOBOKO: {
    key: "JOBOKO",
    name: "Joboko",
    shortName: "Joboko",
    tagline: "Công cụ tìm việc thông minh AI",
    brandColor: "#0d9488",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
    textColor: "text-teal-700 dark:text-teal-400",
    borderColor: "border-teal-300 dark:border-teal-800",
    badgeBg: "bg-teal-600",
    badgeText: "text-white",
    logoLetter: "JBK",
    domain: "vn.joboko.com",
  },
  INDEED: {
    key: "INDEED",
    name: "Indeed Vietnam",
    shortName: "Indeed",
    tagline: "We help people get jobs",
    brandColor: "#2557a7",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    textColor: "text-indigo-800 dark:text-indigo-300",
    borderColor: "border-indigo-300 dark:border-indigo-800",
    badgeBg: "bg-indigo-700",
    badgeText: "text-white",
    logoLetter: "IND",
    domain: "vn.indeed.com",
  },
};

export const ALL_PLATFORMS: PlatformSource[] = [
  "TOPCV",
  "VIETNAMWORKS",
  "VIECLAM24H",
  "CAREERVIET",
  "JOBSGO",
  "CAREERLINK",
  "JOBOKO",
  "INDEED",
];

export function toAsciiSlug(text: string): string {
  if (!text) return "it";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeSearchQuery(title: string, company?: string): string {
  const cleanTitle = (title || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[\\/|:;*+?^${}="!@#%~`,._&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cleanCompany = (company || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/công ty|tnhh|cổ phần|cp|tập đoàn|corporation|solution|vietnam/gi, " ")
    .replace(/[\\/|:;*+?^${}="!@#%~`,._&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const combined = `${cleanTitle} ${cleanCompany}`.replace(/\s+/g, " ").trim();
  return combined || "IT Support";
}

export function getPlatformLiveSearchUrl(platform: PlatformSource, title: string, company?: string): string {
  const query = sanitizeSearchQuery(title, company);
  const encoded = encodeURIComponent(query);

  switch (platform) {
    case "TOPCV":
      return `https://www.topcv.vn/tim-viec-lam-moi-nhat?keyword=${encoded}`;
    case "VIETNAMWORKS":
      return `https://www.vietnamworks.com/viec-lam?q=${encoded}`;
    case "VIECLAM24H":
      return `https://vieclam24h.vn/tim-kiem-viec-lam-nhanh?keyword=${encoded}`;
    case "CAREERVIET":
      return `https://careerviet.vn/viec-lam/${toAsciiSlug(title || "IT Support")}-k-vi.html`;
    case "JOBSGO":
      return `https://jobsgo.vn/viec-lam.html?keyword=${encoded}`;
    case "CAREERLINK":
      return `https://www.careerlink.vn/tim-viec-lam-nhanh?keyword=${encoded}`;
    case "JOBOKO":
      return `https://vn.joboko.com/tim-viec-lam?q=${encoded}`;
    case "INDEED":
      return `https://vn.indeed.com/jobs?q=${encoded}`;
    default:
      return `https://www.google.com/search?q=${encoded}`;
  }
}

export function isDirectJobUrl(url: string): boolean {
  if (!url || !url.startsWith("http")) return false;
  // If it has search query indicators, it is not a direct job post
  if (
    url.includes("keyword=") ||
    url.includes("?q=") ||
    url.includes("&q=") ||
    url.includes("-k-vi.html") ||
    url.includes("tim-viec-lam?") ||
    url.includes("tim-kiem-viec-lam")
  ) {
    return false;
  }
  // Check known platform direct detail patterns
  if (url.includes("topcv.vn/viec-lam/") || url.includes("topcv.vn/brand/")) return true;
  if (url.includes("careerviet.vn/vi/tim-viec-lam/")) return true;
  if (url.includes("vietnamworks.com/") && url.includes("-jv")) return true;
  if (url.includes("careerlink.vn/tim-viec-lam/") && /\/\d+/.test(url)) return true;
  if (url.includes("jobsgo.vn/viec-lam/") && url.includes(".html")) return true;
  if (url.includes("vieclam24h.vn/") && url.includes("id") && url.includes(".html")) return true;
  if (url.includes("vn.joboko.com/viec-lam-")) return true;
  if (url.includes("indeed.com/viewjob")) return true;
  return true;
}

export function buildApplyUrl(
  originalUrl: string,
  sourcePlatform: PlatformSource,
  jobId: string,
  jobTitle?: string,
  companyName?: string
): string {
  let targetUrl = (originalUrl || "").trim();

  // 1. Check if originalUrl is missing or is an invalid placeholder
  const isMockOrBroken =
    !targetUrl ||
    targetUrl.includes("example.com") ||
    targetUrl.includes("vietnamworks.com/404");

  if (isMockOrBroken) {
    return getPlatformLiveSearchUrl(sourcePlatform, jobTitle || "IT Support", companyName);
  }

  // 2. Fix Joboko broken domain (joboko.com -> vn.joboko.com)
  if (targetUrl.includes("://joboko.com/")) {
    targetUrl = targetUrl.replace("://joboko.com/", "://vn.joboko.com/");
  }

  // 3. Fix TopCV search url format if encountered
  if (targetUrl.includes("topcv.vn/tim-viec-lam?")) {
    targetUrl = targetUrl.replace("topcv.vn/tim-viec-lam?", "topcv.vn/tim-viec-lam-moi-nhat?");
  }

  // 4. If targetUrl is an indirect search URL with dangerous characters, regenerate clean live search URL
  if (
    !isDirectJobUrl(targetUrl) &&
    (targetUrl.includes("%28") ||
      targetUrl.includes("%29") ||
      targetUrl.includes("%2F") ||
      targetUrl.includes("(") ||
      targetUrl.includes(")") ||
      targetUrl.includes("/"))
  ) {
    return getPlatformLiveSearchUrl(sourcePlatform, jobTitle || "IT Support", companyName);
  }

  // 5. Append UTM analytics tags safely to direct job urls
  try {
    const url = new URL(targetUrl);
    url.searchParams.set("utm_source", "topviec.vn");
    url.searchParams.set("utm_medium", "job_aggregator");
    url.searchParams.set("utm_campaign", "ai_job_match");
    url.searchParams.set("utm_content", jobId);
    url.searchParams.set("ref", "topviec_vietnam");
    return url.toString();
  } catch {
    const separator = targetUrl.includes("?") ? "&" : "?";
    return `${targetUrl}${separator}utm_source=topviec.vn&utm_medium=job_aggregator&utm_campaign=ai_job_match&utm_content=${jobId}`;
  }
}

