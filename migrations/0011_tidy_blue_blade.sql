ALTER TABLE "projects" DROP COLUMN "completion_date";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."project_status";