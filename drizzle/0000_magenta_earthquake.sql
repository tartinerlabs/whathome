CREATE TYPE "public"."project_status" AS ENUM('upcoming', 'launched', 'selling', 'sold_out', 'completed');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('CCR', 'RCR', 'OCR');--> statement-breakpoint
CREATE TYPE "public"."tenure" AS ENUM('freehold', '99_year', '999_year', '103_year');--> statement-breakpoint
CREATE TYPE "public"."amenity_type" AS ENUM('mrt', 'bus_interchange', 'school', 'mall', 'park', 'hospital');--> statement-breakpoint
CREATE TYPE "public"."image_type" AS ENUM('site_plan', 'floor_plan', 'render', 'photo', 'location_map');--> statement-breakpoint
CREATE TYPE "public"."unit_type" AS ENUM('1BR', '2BR', '3BR', '4BR', '5BR', 'Penthouse');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('condo', 'apt', 'ec', 'strata_landed');--> statement-breakpoint
CREATE TYPE "public"."sale_type" AS ENUM('new_sale', 'sub_sale', 'resale');--> statement-breakpoint
CREATE TYPE "public"."agent_type" AS ENUM('data_ingestion', 'project_research', 'analysis', 'backfill');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "developers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"website" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "developers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"developer_id" uuid,
	"district_number" integer,
	"region" "region",
	"address" text,
	"postal_code" text,
	"tenure" "tenure",
	"tenure_years" integer,
	"tenure_start_date" date,
	"total_units" integer,
	"units_sold" integer,
	"launch_date" date,
	"top_date" date,
	"completion_date" date,
	"status" "project_status" DEFAULT 'upcoming',
	"latitude" numeric,
	"longitude" numeric,
	"site_area" numeric,
	"plot_ratio" numeric,
	"description" text,
	"ai_summary" text,
	"last_researched_at" timestamp,
	"data_source_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nearby_amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"amenity_type" "amenity_type" NOT NULL,
	"name" text NOT NULL,
	"distance_meters" integer,
	"walk_minutes" integer,
	"latitude" numeric,
	"longitude" numeric
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"image_type" "image_type" NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"unit_type" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"unit_type" "unit_type",
	"size_sqft_min" integer,
	"size_sqft_max" integer,
	"price_psf" numeric,
	"price_from" integer,
	"price_to" integer,
	"total_count" integer,
	"sold_count" integer,
	"floor_plan_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"project_name" text NOT NULL,
	"address" text,
	"unit_number" text,
	"floor_range" text,
	"area_sqm" numeric,
	"area_sqft" numeric,
	"transacted_price" integer,
	"price_psf" numeric,
	"contract_date" date,
	"sale_type" "sale_type",
	"property_type" "property_type",
	"district" text,
	"tenure" text,
	"source_dataset" text,
	"source_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_sourceRecordId_unique" UNIQUE("source_record_id")
);
--> statement-breakpoint
CREATE TABLE "price_indices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quarter" text NOT NULL,
	"region" "region" NOT NULL,
	"index_value" numeric,
	"percentage_change" numeric,
	"source_dataset" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_indices_quarter_region_unique" UNIQUE("quarter","region")
);
--> statement-breakpoint
CREATE TABLE "research_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_type" "agent_type" NOT NULL,
	"status" "run_status" DEFAULT 'pending' NOT NULL,
	"project_id" uuid,
	"input_payload" jsonb,
	"output_summary" text,
	"tokens_used" integer,
	"cost_usd" numeric,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_developer_id_developers_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nearby_amenities" ADD CONSTRAINT "nearby_amenities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_units" ADD CONSTRAINT "project_units_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_runs" ADD CONSTRAINT "research_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;