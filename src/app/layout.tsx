import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VersionBadge } from "@/components/layout/VersionBadge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TopViec AI - Nền Tảng Tổng Hợp Việc Làm & Khớp CV Thông Minh Việt Nam",
  description:
    "Hệ thống tổng hợp việc làm và truy vấn trực tiếp 8 nền tảng: TopCV, VietnamWorks, Vieclam24h, CareerViet, JobsGO, CareerLink, Joboko và Indeed. Khớp CV và phân tích kỹ năng.",
  keywords: [
    "tìm việc làm",
    "topcv",
    "vietnamworks",
    "vieclam24h",
    "careerviet",
    "jobsgo",
    "khớp cv ai",
    "việc làm it",
    "việc làm marketing",
    "topviec",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
        {children}
        <VersionBadge />
      </body>
    </html>
  );
}
