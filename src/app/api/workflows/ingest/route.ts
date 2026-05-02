import { headers } from "next/headers";
import { start } from "workflow/api";
import { auth } from "@/lib/auth";
import { dataIngestionWorkflow } from "@/workflows/ingest";

export async function POST(_request: Request) {
  if (process.env.VERCEL_ENV) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  console.log("[workflows] Starting data ingestion workflow (manual trigger)");
  const run = await start(dataIngestionWorkflow);
  return Response.json({ runId: run.runId });
}
