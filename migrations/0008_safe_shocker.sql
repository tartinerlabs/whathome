ALTER TABLE "transactions" ADD COLUMN "inferred_bedroom_type" "unit_type";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_post_harmonisation" boolean;--> statement-breakpoint
CREATE INDEX "idx_txn_project_bedroom" ON "transactions" USING btree ("project_id","inferred_bedroom_type");--> statement-breakpoint
CREATE INDEX "idx_txn_bedroom_date" ON "transactions" USING btree ("inferred_bedroom_type","contract_date");