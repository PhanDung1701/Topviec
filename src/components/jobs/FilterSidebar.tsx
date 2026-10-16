"use client";

import React from "react";
import {
  Filter,
  RotateCcw,
  DollarSign,
  Briefcase,
  Clock,
  Layers,
  Sparkles,
  Check,
  Code2,
  CalendarCheck,
  Cpu,
} from "lucide-react";
import { ExperienceLevel, FilterState, ITSubfield, JobType, PlatformSource } from "@/types/job";
import { ALL_PLATFORMS, PLATFORM_CONFIGS } from "@/utils/platforms";
import { EXPERIENCE_LABELS, IT_SUBFIELD_LABELS, JOB_TYPE_LABELS } from "@/utils/formatters";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  jobCountsByPlatform: Record<PlatformSource, number>;
  hasActiveCV: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  jobCountsByPlatform,
  hasActiveCV,
}) => {
  const toggleSource = (source: PlatformSource) => {
    const current = filters.sources;
    const next = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    onChange({ ...filters, sources: next });
  };

  const selectAllSources = () => {
    onChange({ ...filters, sources: [...ALL_PLATFORMS] });
  };

  const toggleLevel = (level: ExperienceLevel) => {
    const current = filters.experienceLevels;
    const next = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onChange({ ...filters, experienceLevels: next });
  };

  const toggleJobType = (jt: JobType) => {
    const current = filters.jobTypes;
    const next = current.includes(jt)
      ? current.filter((t) => t !== jt)
      : [...current, jt];
    onChange({ ...filters, jobTypes: next });
  };

  const toggleTech = (tech: string) => {
    const current = filters.techStack || [];
    const next = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech];
    onChange({ ...filters, techStack: next });
  };

  const itSubfieldOptions: { id: ITSubfield; label: string }[] = [
    { id: "ALL", label: "Tất cả chuyên ngành IT" },
    { id: "IT_SUPPORT_HELPDESK", label: "IT Support & Helpdesk" },
    { id: "SYSTEM_ADMIN", label: "Quản trị hệ thống (System Admin)" },
    { id: "NETWORK_ENGINEER", label: "Quản trị mạng (Network Engineer)" },
    { id: "SECURITY_AN_NINH", label: "An ninh mạng & Bảo mật (Security)" },
    { id: "INFRASTRUCTURE_CLOUD", label: "Hạ tầng IT & Cloud / Máy chủ" },
    { id: "IT_MANAGEMENT", label: "Trưởng phòng IT / Quản lý CNTT" },
  ];

  const popularTech = [
    "IT Support",
    "Helpdesk",
    "Windows Server",
    "Linux",
    "Cisco",
    "Network Engineer",
    "LAN/WAN",
    "System Admin",
    "Firewall",
    "Active Directory",
    "Troubleshooting",
    "Hardware",
  ];

  const salaryOptions = [
    { id: "all", label: "Tất cả mức lương IT" },
    { id: "under_15", label: "Dưới 15 triệu" },
    { id: "15_25", label: "15 - 25 triệu" },
    { id: "25_40", label: "25 - 40 triệu" },
    { id: "above_40", label: "Trên 40 triệu (Senior/Lead)" },
    { id: "usd", label: "Lương USD ($1,500+)" },
    { id: "negotiable", label: "Thỏa thuận" },
  ];

  const timeOptions = [
    { id: "all", label: "Trong vòng 30 ngày (Mới nhất)" },
    { id: "24h", label: "Vừa đăng 24 giờ qua", isLive: true },
    { id: "7d", label: "7 ngày gần đây" },
    { id: "14d", label: "14 ngày gần đây" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-6">
      {/* Title & Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Bộ Lọc Tuyển Dụng IT</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* FILTER REQUIREMENT 2: Expiration & Freshness Guard */}
      <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyActiveWithinMonth}
            onChange={(e) =>
              onChange({ ...filters, onlyActiveWithinMonth: e.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded accent-emerald-600 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-emerald-950 dark:text-emerald-200 block">
              Lọc bỏ tin hết hạn • Cập nhật ≤ 1 tháng
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
              Tự động loại bỏ các tuyển dụng quá hạn nộp hồ sơ hoặc đăng tải trước 30 ngày.
            </span>
          </div>
        </label>
      </div>

      {/* FILTER: IT Subfield (Chuyên Ngành IT) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-indigo-600" />
          Chuyên Ngành IT
        </label>
        <select
          value={filters.itSubfield}
          onChange={(e) =>
            onChange({ ...filters, itSubfield: e.target.value as ITSubfield })
          }
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {itSubfieldOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER: Tech Stack (Multi-select pills) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-blue-600" />
          Công Nghệ & Kỹ Năng ({filters.techStack?.length || 0})
        </label>
        <div className="flex flex-wrap gap-1.5">
          {popularTech.map((tech) => {
            const isSelected = filters.techStack?.includes(tech);
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTech(tech)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 bg-slate-50 dark:bg-slate-900"
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER: AI Match Score threshold (If CV is active) */}
      {hasActiveCV && (
        <div className="space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Lọc theo Độ Khớp AI
          </label>
          <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
            {[
              { label: "Tất cả", val: undefined },
              { label: "≥ 60%", val: 60 },
              { label: "≥ 80% Top", val: 80 },
            ].map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ ...filters, minMatchScore: opt.val })}
                className={`py-1.5 rounded-lg border transition ${
                  filters.minMatchScore === opt.val
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FILTER: 8 Platform Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            Nguồn cào IT ({filters.sources.length}/8 sàn)
          </label>
          <button
            type="button"
            onClick={selectAllSources}
            className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Chọn tất cả
          </button>
        </div>

        <div className="space-y-1.5">
          {ALL_PLATFORMS.map((platformKey) => {
            const config = PLATFORM_CONFIGS[platformKey];
            const isChecked = filters.sources.includes(platformKey);
            const count = jobCountsByPlatform[platformKey] || 0;

            return (
              <div
                key={platformKey}
                onClick={() => toggleSource(platformKey)}
                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition select-none ${
                  isChecked
                    ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.badgeBg} ${config.badgeText}`}
                  >
                    {config.logoLetter}
                  </span>

                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {config.name}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER: Salary Range */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          Mức lương IT
        </label>
        <div className="space-y-1">
          {salaryOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs"
            >
              <input
                type="radio"
                name="salaryRange"
                value={opt.id}
                checked={filters.salaryRange === opt.id}
                onChange={() => onChange({ ...filters, salaryRange: opt.id })}
                className="accent-emerald-600"
              />
              <span
                className={
                  filters.salaryRange === opt.id
                    ? "font-bold text-emerald-700 dark:text-emerald-400"
                    : "text-slate-700 dark:text-slate-300"
                }
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* FILTER: Experience Level */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-blue-600" />
          Cấp bậc kỹ sư
        </label>
        <div className="space-y-1.5">
          {(
            [
              "INTERN",
              "FRESHER",
              "JUNIOR",
              "MIDDLE",
              "SENIOR",
              "LEAD_MANAGER",
            ] as ExperienceLevel[]
          ).map((level) => {
            const isChecked = filters.experienceLevels.includes(level);
            return (
              <label
                key={level}
                onClick={() => toggleLevel(level)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs select-none"
              >
                <div
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                    isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
                <span
                  className={
                    isChecked
                      ? "font-bold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }
                >
                  {EXPERIENCE_LABELS[level]}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* FILTER: Job Types */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-purple-600" />
          Hình thức làm việc
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(["FULL_TIME", "PART_TIME", "REMOTE", "HYBRID"] as JobType[]).map((jt) => {
            const isChecked = filters.jobTypes.includes(jt);
            return (
              <button
                key={jt}
                type="button"
                onClick={() => toggleJobType(jt)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition ${
                  isChecked
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                {JOB_TYPE_LABELS[jt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER: Time Posted (<= 30 days) */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          Thời gian cập nhật (≤ 1 tháng)
        </label>
        <div className="space-y-1">
          {timeOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timePosted"
                  value={opt.id}
                  checked={filters.timePosted === opt.id}
                  onChange={() => onChange({ ...filters, timePosted: opt.id })}
                  className="accent-emerald-600"
                />
                <span
                  className={
                    filters.timePosted === opt.id
                      ? "font-bold text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300"
                  }
                >
                  {opt.label}
                </span>
              </div>
              {opt.isLive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
