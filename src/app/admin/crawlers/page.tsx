import React from "react";
import { Metadata } from "next";
import { CrawlerDashboard } from "@/components/crawlers/CrawlerDashboard";

export const metadata: Metadata = {
  title: "Quản Lý Trình Cào Dữ Liệu Theo Giờ | TopViec AI Crawler Monitor",
  description:
    "Trang giám sát 8 nguồn việc làm được truy vấn trực tiếp, cùng trạng thái crawler service tùy chọn.",
};

export default function AdminCrawlersPage() {
  return <CrawlerDashboard />;
}
