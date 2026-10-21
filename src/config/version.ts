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
  version: "0.2.0",
  displayVersion: "v0.2.0",
  buildId: "2026.10.21-direct8",
  channel: process.env.NODE_ENV === "production" ? "Production" : "Dev",
  releaseDate: "21/10/2026",
  updateCycle: "8 nguồn trực tiếp • Cron hằng ngày",
  directLinks: "8 nguồn truy vấn song song",
};
