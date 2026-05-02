import { start } from "workflow/api";
import { projectResearchWorkflow } from "@/workflows/research";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as { projectId?: string };

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!body.projectId || !UUID_REGEX.test(body.projectId)) {
    return Response.json(
      { error: "projectId must be a valid UUID" },
      { status: 400 },
    );
  }

  console.log(
    "[workflows] Starting research workflow for project %s",
    body.projectId,
  );
  const run = await start(projectResearchWorkflow, [body.projectId]);
  return Response.json({ runId: run.runId });
}
