CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_path" text NOT NULL,
	"visitor_id" text NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
