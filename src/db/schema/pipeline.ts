import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const pipelineProjects = pgTable(
  "pipeline_projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectName: text().notNull(),
    street: text(),
    district: integer(),
    developerName: text(),
    totalUnits: integer(),
    noOfCondo: integer(),
    noOfApartment: integer(),
    noOfDetachedHouse: integer(),
    noOfSemiDetached: integer(),
    noOfTerrace: integer(),
    expectedTopYear: text(),
    snapshotQuarter: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.projectName, table.snapshotQuarter)],
);
