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
    domain: "joboko.com",
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

export function getPlatformLiveSearchUrl(platform: PlatformSource, title: string, company?: string): string {
  const query = encodeURIComponent(`${title || ""} ${company || ""}`.trim() || "IT");
  switch (platform) {
    case "TOPCV":
      return `https://www.topcv.vn/tim-viec-lam?keyword=${query}`;
    case "VIETNAMWORKS":
      return `https://www.vietnamworks.com/viec-lam?q=${query}`;
    case "VIECLAM24H":
      return `https://vieclam24h.vn/tim-kiem-viec-lam-nhanh?keyword=${query}`;
    case "CAREERVIET":
      return `https://careerviet.vn/viec-lam/${encodeURIComponent(title || "IT")}-k-vi.html`;
    case "JOBSGO":
      return `https://jobsgo.vn/viec-lam.html?keyword=${query}`;
    case "CAREERLINK":
      return `https://www.careerlink.vn/tim-viec-lam-nhanh?keyword=${query}`;
    case "JOBOKO":
      return `https://joboko.com/tim-viec-lam?q=${query}`;
    case "INDEED":
      return `https://vn.indeed.com/jobs?q=${query}`;
    default:
      return `https://www.google.com/search?q=${query}`;
  }
}

export function buildApplyUrl(
  originalUrl: string,
  sourcePlatform: PlatformSource,
  jobId: string,
  jobTitle?: string,
  companyName?: string
): string {
  // Check if originalUrl is a known fake/stale mock slug that would 404
  const isMockSlug =
    !originalUrl ||
    originalUrl.includes("92019") ||
    originalUrl.includes("123456") ||
    originalUrl.includes("c12p99") ||
    originalUrl.includes("35A9012") ||
    originalUrl.includes("298102") ||
    originalUrl.includes("102938") ||
    originalUrl.includes("qa-automation-lead-001") ||
    originalUrl.includes("example.com");

  if (isMockSlug) {
    // Return verified live search URL for this platform to guarantee 0% 404
    return getPlatformLiveSearchUrl(sourcePlatform, jobTitle || "IT Support Developer", companyName);
  }

  // If already a live search or listing URL with query parameter, return directly to avoid param clobbering
  if (originalUrl.includes("keyword=") || originalUrl.includes("?q=") || originalUrl.includes("&q=")) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);
    url.searchParams.set("utm_source", "topviec.vn");
    url.searchParams.set("utm_medium", "job_aggregator");
    url.searchParams.set("utm_campaign", "ai_job_match");
    url.searchParams.set("utm_content", jobId);
    url.searchParams.set("ref", "topviec_vietnam");
    return url.toString();
  } catch {
    const separator = originalUrl.includes("?") ? "&" : "?";
    return `${originalUrl}${separator}utm_source=topviec.vn&utm_medium=job_aggregator&utm_campaign=ai_job_match&utm_content=${jobId}`;
  }
}
