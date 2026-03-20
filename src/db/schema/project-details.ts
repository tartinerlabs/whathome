import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const unitTypeEnum = pgEnum("unit_type", [
  "1BR",
  "2BR",
  "3BR",
  "4BR",
  "5BR",
  "Penthouse",
]);

export const amenityTypeEnum = pgEnum("amenity_type", [
  "mrt",
  "bus_interchange",
  "school",
  "mall",
  "park",
  "hospital",
]);

export const imageTypeEnum = pgEnum("image_type", [
  "site_plan",
  "floor_plan",
  "render",
  "photo",
  "location_map",
]);

export const projectUnits = pgTable("project_units", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  unitType: unitTypeEnum(),
  sizeSqftMin: integer(),
  sizeSqftMax: integer(),
  pricePsf: numeric(),
  priceFrom: integer(),
  priceTo: integer(),
  totalCount: integer(),
  soldCount: integer(),
  floorPlanUrl: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectUnitsRelations = relations(projectUnits, ({ one }) => ({
  project: one(projects, {
    fields: [projectUnits.projectId],
    references: [projects.id],
  }),
}));

export const nearbyAmenities = pgTable("nearby_amenities", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  amenityType: amenityTypeEnum().notNull(),
  name: text().notNull(),
  distanceMeters: integer(),
  walkMinutes: integer(),
  latitude: numeric(),
  longitude: numeric(),
});

export const nearbyAmenitiesRelations = relations(
  nearbyAmenities,
  ({ one }) => ({
    project: one(projects, {
      fields: [nearbyAmenities.projectId],
      references: [projects.id],
    }),
  }),
);

export const projectImages = pgTable("project_images", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  imageType: imageTypeEnum().notNull(),
  url: text().notNull(),
  altText: text(),
  unitType: text(),
  sortOrder: integer().default(0),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));
