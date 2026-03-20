import { db } from "@/db";
import { pageViews } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pagePath, visitorId } = body;

    if (
      typeof pagePath !== "string" ||
      typeof visitorId !== "string" ||
      !pagePath.startsWith("/") ||
      pagePath.length > 500 ||
      visitorId.length === 0 ||
      visitorId.length > 500
    ) {
      return new Response(null, { status: 400 });
    }

    await db.insert(pageViews).values({ pagePath, visitorId });

    return new Response(null, { status: 202 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
