import { relations } from "drizzle-orm";
import {
  date,
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
import { researchRuns } from "./research";
import { transactions } from "./transactions";

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

export const projects = pgTable("projects", {
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
  status: projectStatusEnum().default("upcoming"),
  latitude: numeric(),
  longitude: numeric(),
  siteArea: numeric(),
  plotRatio: numeric(),
  description: text(),
  aiSummary: text(),
  lastResearchedAt: timestamp(),
  dataSourceHash: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  developer: one(developers, {
    fields: [projects.developerId],
    references: [developers.id],
  }),
  units: many(projectUnits),
  transactions: many(transactions),
  nearbyAmenities: many(nearbyAmenities),
  images: many(projectImages),
  researchRuns: many(researchRuns),
}));
