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
import { projects } from "./projects";

export const saleTypeEnum = pgEnum("sale_type", [
  "new_sale",
  "sub_sale",
  "resale",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "condo",
  "apt",
  "ec",
  "strata_landed",
]);

export const typeOfAreaEnum = pgEnum("type_of_area", [
  "strata",
  "land",
  "unknown",
]);

export const transactions = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid().references(() => projects.id),
  projectName: text().notNull(),
  address: text(),
  unitNumber: text(),
  floorRange: text(),
  areaSqm: numeric(),
  areaSqft: numeric(),
  transactedPrice: integer(),
  nettPrice: integer(),
  pricePsf: numeric(),
  contractDate: date(),
  saleType: saleTypeEnum(),
  propertyType: propertyTypeEnum(),
  typeOfArea: typeOfAreaEnum(),
  noOfUnits: integer(),
  district: integer(),
  tenure: text(),
  svyX: numeric(),
  svyY: numeric(),
  sourceDataset: text(),
  sourceRecordId: text().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
}));
