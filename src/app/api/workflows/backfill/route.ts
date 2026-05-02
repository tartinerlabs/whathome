import { headers } from "next/headers";
import { start } from "workflow/api";
import { auth } from "@/lib/auth";
import { backfillWorkflow } from "@/workflows/backfill/project";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
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
