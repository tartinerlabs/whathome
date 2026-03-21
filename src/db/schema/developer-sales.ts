import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const developerSales = pgTable(
  "developer_sales",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectName: text().notNull(),
    street: text(),
    developer: text(),
    marketSegment: text(),
    district: integer(),
    refPeriod: text().notNull(),
    medianPrice: numeric(),
    lowestPrice: numeric(),
    highestPrice: numeric(),
    unitsAvail: integer(),
    launchedToDate: integer(),
    soldToDate: integer(),
    launchedInMonth: integer(),
    soldInMonth: integer(),
    svyX: numeric(),
    svyY: numeric(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.projectName, table.refPeriod)],
);
