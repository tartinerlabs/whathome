import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const agentTypeEnum = pgEnum("agent_type", [
  "data_ingestion",
  "project_research",
  "analysis",
  "backfill",
]);

export const runStatusEnum = pgEnum("run_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const researchRuns = pgTable("research_runs", {
  id: uuid().primaryKey().defaultRandom(),
  agentType: agentTypeEnum().notNull(),
  status: runStatusEnum().notNull().default("pending"),
  projectId: uuid().references(() => projects.id),
  inputPayload: jsonb(),
  outputSummary: text(),
  tokensUsed: integer(),
  costUsd: numeric(),
  startedAt: timestamp(),
  completedAt: timestamp(),
  errorMessage: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const researchRunsRelations = relations(researchRuns, ({ one }) => ({
  project: one(projects, {
    fields: [researchRuns.projectId],
    references: [projects.id],
  }),
}));
