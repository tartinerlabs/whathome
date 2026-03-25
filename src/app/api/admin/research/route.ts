import { headers } from "next/headers";
import { start } from "workflow/api";
import { auth } from "@/lib/auth";
import { projectResearchWorkflow } from "@/workflows/research";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const projectIds: string[] = body?.projectIds ?? [];

  if (!projectIds.length) {
    return new Response("projectIds must be a non-empty array", {
      status: 400,
    });
  }

  const runs = await Promise.all(
    projectIds.map((projectId) =>
      start(() => projectResearchWorkflow(projectId)),
    ),
  );

  return Response.json({ runIds: runs.map((run) => run.runId) });
}
