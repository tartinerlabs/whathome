import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  dialect: "postgresql",
  schema: "./src/db/schema",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
