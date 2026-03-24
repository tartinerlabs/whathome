import { start } from "workflow/api";
import { dataIngestionWorkflow } from "@/workflows/ingest";

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== "development") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorised", { status: 401 });
    }
  }

  console.log("[workflows] Starting daily data ingestion workflow (cron)");
  const run = await start(dataIngestionWorkflow);

  return Response.json({ runId: run.runId });
}
