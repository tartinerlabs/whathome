import { start } from "workflow/api";
import { dataIngestionWorkflow } from "@/workflows/ingest";

export async function POST() {
  console.log("[workflows] Starting data ingestion workflow (manual trigger)");
  const run = await start(dataIngestionWorkflow);
  return Response.json({ runId: run.runId });
}
