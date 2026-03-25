import {
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { regionEnum } from "./projects";

export const priceIndices = pgTable(
  "price_indices",
  {
    id: uuid().primaryKey().defaultRandom(),
    quarter: text().notNull(),
    region: regionEnum().notNull(),
    indexValue: numeric(),
    percentageChange: numeric(),
    sourceDataset: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.quarter, table.region)],
);
