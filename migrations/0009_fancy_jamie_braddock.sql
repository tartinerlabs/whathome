CREATE TYPE "public"."holding_bucket" AS ENUM('0-3y', '3-5y', '5-7y', '7-10y', '10y+');--> statement-breakpoint
CREATE TABLE "transaction_pairs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"buy_transaction_id" uuid,
	"sell_transaction_id" uuid,
	"inferred_bedroom_type" "unit_type",
	"buy_price" integer,
	"sell_price" integer,
	"buy_date" date,
	"sell_date" date,
	"buy_psf" numeric,
	"sell_psf" numeric,
	"area_sqft" numeric,
	"holding_months" integer,
	"profit_amount" integer,
	"profit_percent" numeric,
	"annualised_return" numeric,
	"holding_bucket" "holding_bucket",
	"region" text,
	"district" integer,
	"decade" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction_pairs" ADD CONSTRAINT "transaction_pairs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_pairs" ADD CONSTRAINT "transaction_pairs_buy_transaction_id_transactions_id_fk" FOREIGN KEY ("buy_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_pairs" ADD CONSTRAINT "transaction_pairs_sell_transaction_id_transactions_id_fk" FOREIGN KEY ("sell_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pairs_project" ON "transaction_pairs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_pairs_bedroom_decade" ON "transaction_pairs" USING btree ("inferred_bedroom_type","decade","region");