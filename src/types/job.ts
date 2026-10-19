export type PlatformSource =
  | 'TOPCV'
  | 'VIETNAMWORKS'
  | 'VIECLAM24H'
  | 'CAREERVIET'
  | 'JOBSGO'
  | 'CAREERLINK'
  | 'JOBOKO'
  | 'INDEED';

export type ExperienceLevel =
  | 'INTERN'
  | 'FRESHER'
  | 'JUNIOR'
  | 'MIDDLE'
  | 'SENIOR'
  | 'LEAD_MANAGER';

export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'REMOTE'
  | 'HYBRID'
  | 'CONTRACT';

export type ITSubfield =
  | 'ALL'
  | 'IT_SUPPORT_HELPDESK'
  | 'SYSTEM_ADMIN'
  | 'NETWORK_ENGINEER'
  | 'NETWORK_SYSTEM'
  | 'SECURITY_AN_NINH'
  | 'INFRASTRUCTURE_CLOUD'
  | 'IT_MANAGEMENT'
  | 'DEVOPS_CLOUD'
  | 'SECURITY'
  | 'FRONTEND'
  | 'BACKEND'
  | 'FULLSTACK'
  | 'MOBILE'
  | 'AI_DATA'
  | 'QA_TESTER'
  | 'PM_BA_PRODUCT';

export interface JobListing {
  id: string;
  title: string;
  company_name: string;
  company_logo: string;
  location_city: string; // e.g., Hà Nội, TP.HCM, Đà Nẵng
  location_district: string; // e.g., Cầu Giấy, Quận 1, Hải Châu
  address_detail: string;
  salary_min: number; // in VND millions or USD
  salary_max: number;
  salary_currency: 'VND' | 'USD';
  salary_raw_text: string; // e.g., "25 - 40 triệu", "1,500 - 2,500 USD", "Thỏa thuận"
  description: string;
  requirements: string[];
  benefits: string[];
  skills_tags: string[];
  job_type: JobType;
  experience_level: ExperienceLevel;
  industry: string;
  it_subfield?: ITSubfield;
  source_platform: PlatformSource;
  source_url: string;
  source_job_id: string;
  fingerprint_hash: string;
  posted_at: string; // ISO date string (within 1 month)
  crawled_at: string; // ISO date string
  expires_at: string; // ISO date string for job expiration deadline
  is_active: boolean;
  is_expired?: boolean;
  update_time_text?: string;
  views_count?: number;
  applied_count?: number;
  source_cross_posted?: PlatformSource[]; // If deduplicated across multiple platforms
  company_banner?: string;
  company_website?: string;
  company_size?: string;
  company_intro?: string;
  contact_info?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    instructions?: string;
    language?: string;
  };
  description_sections?: {
    heading: string;
    items: string[];
  }[];
  description_items?: string[];
  welfare_list?: string[];
  other_info?: {
    degree?: string;
    gender?: string;
    allowance?: string;
    probation_period?: string;
    training_opportunity?: string;
    age_range?: string;
    working_hours?: string;
    workplace_environment?: string;
    vacation_days?: string;
    detailed_benefits?: string[];
    exact_salary?: string;
    job_level?: string;
    work_type?: string;
    experience_required?: string;
    recruitment_quantity?: string;
    industry_category?: string;
    posted_date_text?: string;
    deadline_text?: string;
    [key: string]: any;
  };
}

export interface UserCVProfile {
  fullName: string;
  targetRole: string;
  yearsOfExperience: number;
  skills: string[];
  languages: string[];
  summary?: string;
  fileName?: string;
  rawText?: string;
}

export interface MatchAnalysis {
  score: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  experienceGapNote?: string;
  recommendation: string;
  strengths: string[];
  adviceTips: string[];
}

export interface FilterState {
  keyword: string;
  city: string;
  district: string;
  sources: PlatformSource[];
  itSubfield: ITSubfield;
  techStack: string[];
  salaryRange: string; // 'all' | 'under_15' | '15_25' | '25_40' | 'above_40' | 'usd' | 'negotiable'
  experienceLevels: ExperienceLevel[];
  jobTypes: JobType[];
  timePosted: string; // 'all' | '24h' | '7d' | '14d' | '30d'
  sortBy: 'match' | 'newest' | 'salary_desc';
  minMatchScore?: number;
  onlyActiveWithinMonth: boolean; // strictly filter out expired jobs or older than 30 days
}

export interface CrawlerLogEntry {
  id: string;
  timestamp: string;
  platform: PlatformSource;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  details?: string;
}

export interface CrawlerStatus {
  platform: PlatformSource;
  name: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'RUNNING' | 'ERROR' | 'IDLE';
  lastSync: string;
  newJobsPastHour: number;
  deduplicatedCount: number;
  expiredPrunedPastHour?: number;
  totalActiveJobs: number;
  healthPercent: number;
  targetDomain: string;
}
