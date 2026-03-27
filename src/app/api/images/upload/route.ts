import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { db } from "@/db";
import { projectImages } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const imageType = formData.get("imageType") as string | null;
  const altText = formData.get("altText") as string | null;
  const unitType = formData.get("unitType") as string | null;
  const sortOrder = formData.get("sortOrder");

  if (!file || !projectId || !imageType) {
    return new Response("Missing required fields: file, projectId, imageType", {
      status: 400,
    });
  }

  const blob = await put(
    `projects/${projectId}/${imageType}/${file.name}`,
    file,
    { access: "public" },
  );

  const [image] = await db
    .insert(projectImages)
    .values({
      projectId,
      imageType: imageType as (typeof projectImages.$inferInsert)["imageType"],
      url: blob.url,
      altText: altText ?? undefined,
      unitType: unitType ?? undefined,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    })
    .returning();

  return Response.json(image);
}
