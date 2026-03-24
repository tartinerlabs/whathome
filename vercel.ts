import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  regions: ["sin1"],
  crons: [
    {
      path: "/api/cron/daily-ingest",
      schedule: "0 2 * * *",
    },
    {
      path: "/api/cron/prices",
      schedule: "0 3 * * 1",
    },
  ],
};
