import { headers } from "next/headers";
import { getRun } from "workflow/api";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  if (process.env.VERCEL_ENV) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const { runId } = await params;
  const { searchParams } = new URL(request.url);
  const startIndexParam = searchParams.get("startIndex");
  const startIndex = startIndexParam
    ? Number.parseInt(startIndexParam, 10)
    : undefined;

  return new Response(getRun(runId).getReadable({ startIndex }), {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
