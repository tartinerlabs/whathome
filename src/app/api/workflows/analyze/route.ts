import { start } from "workflow/api";
import { analysisWorkflow } from "@/workflows/analysis";

export async function POST(request: Request) {
  const body = (await request.json()) as { projectId?: string };

  if (!body.projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  console.log(
    "[workflows] Starting analysis workflow for project %s",
    body.projectId,
  );
  const run = await start(analysisWorkflow, [body.projectId!]);
  return Response.json({ runId: run.runId });
}
