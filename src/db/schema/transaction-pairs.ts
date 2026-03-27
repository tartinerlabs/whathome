import { relations } from "drizzle-orm";
import {
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
import { unitTypeEnum } from "./project-details";
import { projects } from "./projects";
import { transactions } from "./transactions";

export const holdingBucketEnum = pgEnum("holding_bucket", [
  "0-3y",
  "3-5y",
  "5-7y",
  "7-10y",
  "10y+",
]);

export const transactionPairs = pgTable(
  "transaction_pairs",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid().references(() => projects.id),
    buyTransactionId: uuid().references(() => transactions.id),
    sellTransactionId: uuid().references(() => transactions.id),
    inferredBedroomType: unitTypeEnum(),
    buyPrice: integer(),
    sellPrice: integer(),
    buyDate: date(),
    sellDate: date(),
    buyPsf: numeric(),
    sellPsf: numeric(),
    areaSqft: numeric(),
    holdingMonths: integer(),
    profitAmount: integer(),
    profitPercent: numeric(),
    annualisedReturn: numeric(),
    holdingBucket: holdingBucketEnum(),
    region: text(),
    district: integer(),
    decade: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_pairs_project").on(table.projectId),
    index("idx_pairs_bedroom_decade").on(
      table.inferredBedroomType,
      table.decade,
      table.region,
    ),
  ],
);

export const transactionPairsRelations = relations(
  transactionPairs,
  ({ one }) => ({
    project: one(projects, {
      fields: [transactionPairs.projectId],
      references: [projects.id],
    }),
    buyTransaction: one(transactions, {
      fields: [transactionPairs.buyTransactionId],
      references: [transactions.id],
    }),
    sellTransaction: one(transactions, {
      fields: [transactionPairs.sellTransactionId],
      references: [transactions.id],
    }),
  }),
);
