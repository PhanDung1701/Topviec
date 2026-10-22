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
  version: "0.3.0",
  displayVersion: "v0.3.0",
  buildId: "2026.10.22-saved-jobs",
  channel: process.env.NODE_ENV === "production" ? "Production" : "Dev",
  releaseDate: "22/10/2026",
  updateCycle: "8 nguồn trực tiếp • Cron hằng ngày",
  directLinks: "8 nguồn truy vấn song song",
};
