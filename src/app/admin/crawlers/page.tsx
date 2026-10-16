import React from "react";
import { Metadata } from "next";
import { CrawlerDashboard } from "@/components/crawlers/CrawlerDashboard";

export const metadata: Metadata = {
  title: "Quản Lý Trình Cào Dữ Liệu Theo Giờ | TopViec AI Crawler Monitor",
  description:
    "Trang tổng quan giám sát tiến trình cào việc làm tự động từ TopCV, VietnamWorks, Vieclam24h, CareerViet, JobsGO, CareerLink, Joboko, Indeed và thuật toán gộp trùng lặp tin tuyển dụng.",
};

export default function AdminCrawlersPage() {
  return <CrawlerDashboard />;
}
