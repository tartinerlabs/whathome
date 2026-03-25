CREATE TABLE "median_rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" text NOT NULL,
	"street" text,
	"district" integer,
	"ref_period" text NOT NULL,
	"median" numeric,
	"psf25" numeric,
	"psf75" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "median_rentals_projectName_refPeriod_unique" UNIQUE("project_name","ref_period")
);
--> statement-breakpoint
CREATE TABLE "rental_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"project_name" text NOT NULL,
	"street" text,
	"property_type" text,
	"district" integer,
	"no_of_bed_room" text,
	"rent" integer,
	"area_sqft" numeric,
	"area_sqm" numeric,
	"lease_date" date,
	"source_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rental_contracts_sourceRecordId_unique" UNIQUE("source_record_id")
);
--> statement-breakpoint
ALTER TABLE "rental_contracts" ADD CONSTRAINT "rental_contracts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;