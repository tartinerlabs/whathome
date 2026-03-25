import { relations, type SQL, sql } from "drizzle-orm";
import {
  customType,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { developers } from "./developers";
import {
  nearbyAmenities,
  projectImages,
  projectUnits,
} from "./project-details";

import { transactions } from "./transactions";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const regionEnum = pgEnum("region", ["CCR", "RCR", "OCR"]);

export const tenureEnum = pgEnum("tenure", [
  "freehold",
  "99_year",
  "999_year",
  "103_year",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "upcoming",
  "launched",
  "selling",
  "sold_out",
  "completed",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    developerId: uuid().references(() => developers.id),
    districtNumber: integer(),
    region: regionEnum(),
    address: text(),
    postalCode: text(),
    tenure: tenureEnum(),
    tenureYears: integer(),
    tenureStartDate: date(),
    totalUnits: integer(),
    unitsSold: integer(),
    launchDate: date(),
    topDate: date(),
    completionDate: date(),
    status: projectStatusEnum().default("completed"),
    latitude: numeric(),
    longitude: numeric(),
    svyX: numeric(),
    svyY: numeric(),
    marketSegment: text(),
    planningArea: text(),
    siteArea: numeric(),
    plotRatio: numeric(),
    description: text(),
    aiSummary: text(),
    lastResearchedAt: timestamp(),
    dataSourceHash: text(),
    searchVector: tsvector().generatedAlwaysAs(
      (): SQL =>
        sql`to_tsvector('english', coalesce(${projects.name}, '') || ' ' || coalesce(${projects.address}, '') || ' ' || coalesce(${projects.planningArea}, ''))`,
    ),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_projects_search").using("gin", table.searchVector)],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  developer: one(developers, {
    fields: [projects.developerId],
    references: [developers.id],
  }),
  units: many(projectUnits),
  transactions: many(transactions),
  nearbyAmenities: many(nearbyAmenities),
  images: many(projectImages),
}));
