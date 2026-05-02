import { start } from "workflow/api";
import { dataIngestionWorkflow } from "@/workflows/ingest";

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV) {
    const authHeader = request.headers.get("authorization");
    if (
      !process.env.CRON_SECRET ||
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  console.log("[workflows] Starting daily data ingestion workflow (cron)");
  const run = await start(dataIngestionWorkflow);

  return Response.json({ runId: run.runId });
}
