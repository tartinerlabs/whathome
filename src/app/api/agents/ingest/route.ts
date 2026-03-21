import { start } from "workflow/api";
import { dataIngestionWorkflow } from "@/lib/agents/data-ingestion/workflow";

export async function POST() {
  console.log("[agents] Starting data ingestion workflow (manual trigger)");
  const run = await start(dataIngestionWorkflow);
  return Response.json({ runId: run.runId });
}
