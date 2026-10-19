export interface AppVersionConfig {
  name: string;
  version: string;
  displayVersion: string;
  buildId: string;
  channel: string;
  releaseDate: string;
  updateCycle: string;
  directLinks: string;
}

export const APP_VERSION_CONFIG: AppVersionConfig = {
  name: "TopViec AI",
  version: "0.1.0",
  displayVersion: "v0.1.0",
  buildId: "2026.10.19-live",
  channel: process.env.NODE_ENV === "production" ? "Production" : "Dev",
  releaseDate: "19/10/2026",
  updateCycle: "Tự động thu thập mỗi 6 giờ",
  directLinks: "100% Link gốc trực tiếp",
};
