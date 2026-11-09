import { db, images } from "@/db";
import { eq } from "drizzle-orm";

// Each upload gets a new random id and is never edited, so the response can be cached forever by the browser and the CDN.
export async function GET(_: Request, { params }: RouteContext<"/api/img/[id]">) {
  const [img] = await db.select().from(images).where(eq(images.id, (await params).id));
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(img.data, "base64"), {
    headers: { "content-type": img.contentType, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
}
