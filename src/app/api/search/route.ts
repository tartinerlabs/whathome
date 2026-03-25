import { searchAll } from "@/lib/queries/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return Response.json([]);
  }

  const results = await searchAll(q);

  return Response.json(results);
}
