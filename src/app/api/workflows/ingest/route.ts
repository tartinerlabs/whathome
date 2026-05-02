import { start } from "workflow/api";
import { dataIngestionWorkflow } from "@/workflows/ingest";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("[workflows] Starting data ingestion workflow (manual trigger)");
  const run = await start(dataIngestionWorkflow);
  return Response.json({ runId: run.runId });
}
