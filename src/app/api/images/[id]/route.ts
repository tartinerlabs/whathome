import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { projectImages } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await params;

  const [image] = await db
    .select({ url: projectImages.url })
    .from(projectImages)
    .where(eq(projectImages.id, id));

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  await del(image.url);
  await db.delete(projectImages).where(eq(projectImages.id, id));

  return new Response(null, { status: 204 });
}
