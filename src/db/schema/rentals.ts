import { relations } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const rentalContracts = pgTable("rental_contracts", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid().references(() => projects.id),
  projectName: text().notNull(),
  street: text(),
  propertyType: text(),
  district: integer(),
  noOfBedRoom: text(),
  rent: integer(),
  areaSqft: numeric(),
  areaSqm: numeric(),
  leaseDate: date(),
  sourceRecordId: text().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const rentalContractsRelations = relations(
  rentalContracts,
  ({ one }) => ({
    project: one(projects, {
      fields: [rentalContracts.projectId],
      references: [projects.id],
    }),
  }),
);

export const medianRentals = pgTable(
  "median_rentals",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectName: text().notNull(),
    street: text(),
    district: integer(),
    refPeriod: text().notNull(),
    median: numeric(),
    psf25: numeric(),
    psf75: numeric(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.projectName, table.refPeriod)],
);
