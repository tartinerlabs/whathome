import { headers } from "next/headers";
import { start } from "workflow/api";
import { auth } from "@/lib/auth";
import { projectResearchWorkflow } from "@/workflows/research";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
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
