import { start } from "workflow/api";
import { backfillWorkflow } from "@/workflows/backfill/project";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    batchSize?: number;
  };

  const batchSize = body.batchSize ?? 10;

  console.log(
    `[workflows] Starting backfill workflow (batchSize: ${batchSize})`,
  );
  const run = await start(() => backfillWorkflow(batchSize));
  return Response.json({ runId: run.runId });
}
