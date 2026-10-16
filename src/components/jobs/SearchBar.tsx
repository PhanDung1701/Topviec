"use client";

import React from "react";
import { Search, MapPin, Building2, X, Sparkles, Navigation } from "lucide-react";
import { VIETNAM_LOCATIONS } from "@/utils/formatters";

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  onSearchSubmit?: () => void;
  totalResultsCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  keyword,
  onKeywordChange,
  city,
  onCityChange,
  district,
  onDistrictChange,
  onSearchSubmit,
  totalResultsCount,
}) => {
  // Find districts for current selected city
  const currentLocation = VIETNAM_LOCATIONS.find((loc) => loc.city === city) || VIETNAM_LOCATIONS[0];

  const handleCitySelect = (newCity: string) => {
    onCityChange(newCity);
    onDistrictChange("Tất cả quận/huyện");
  };

  const popularSearches = [
    "IT Support",
    "Nhân viên IT",
    "Helpdesk",
    "System Admin",
    "Network",
    "Mạng",
    "System",
    "Admin",
    "IT",
  ];

  return (
    <div className="w-full space-y-3">
      {/* Main Search Container */}
      <div className="flex flex-col md:flex-row items-stretch rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-lg shadow-slate-200/50 dark:shadow-none focus-within:border-emerald-500 transition">
        {/* Keyword Input */}
        <div className="flex flex-1 items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearchSubmit) {
                  onSearchSubmit();
                }
              }}
              placeholder="Nhập từ khóa IT: IT Support, Helpdesk, Network, System, Admin..."
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {keyword && (
              <button
                onClick={() => onKeywordChange("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* City Select */}
        <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 md:w-48">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <select
            value={city}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {VIETNAM_LOCATIONS.map((loc) => (
              <option key={loc.city} value={loc.city} className="bg-white dark:bg-slate-900">
                {loc.city}
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div className="flex items-center gap-2 px-3 py-2 md:w-52">
          <Navigation className="h-4 w-4 text-emerald-600 shrink-0" />
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={city === "Toàn quốc"}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer disabled:opacity-50"
          >
            {currentLocation.districts.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-slate-900">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Search CTA */}
        <button
          onClick={onSearchSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 active:scale-95 transition"
        >
          <Search className="h-4 w-4" />
          <span>Tìm kiếm</span>
        </button>
      </div>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Tìm nhanh phổ biến:
        </span>
        {popularSearches.map((term, idx) => (
          <button
            key={idx}
            onClick={() => onKeywordChange(term)}
            className="rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition text-[11px] font-medium"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};
