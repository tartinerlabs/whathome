import { start } from "workflow/api";
import { backfillWorkflow } from "@/workflows/backfill/project";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    batchSize?: number;
  };

  const batchSize = body.batchSize ?? 10;

  console.log(
    `[workflows] Starting backfill workflow (batchSize: ${batchSize})`,
  );
  const run = await start(backfillWorkflow, [batchSize]);
  return Response.json({ runId: run.runId });
}
