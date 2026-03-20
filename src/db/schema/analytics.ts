import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: uuid().primaryKey().defaultRandom(),
  pagePath: text().notNull(),
  visitorId: text().notNull(),
  recordedAt: timestamp().notNull().defaultNow(),
});
