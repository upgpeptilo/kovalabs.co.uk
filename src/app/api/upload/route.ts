import { randomBytes } from "crypto";
import { db, images } from "@/db";
import { getAdmin } from "@/lib/admin";

// SVG is excluded on purpose: it can carry scripts. Vercel caps request bodies at 4.5 MB.
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  if (!TYPES.includes(file.type)) return Response.json({ error: "Use a JPG, PNG, WebP, GIF or AVIF image." }, { status: 415 });
  if (file.size > MAX) return Response.json({ error: "Image is over 4 MB. Please resize it." }, { status: 413 });
  const id = randomBytes(9).toString("hex");
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  await db.insert(images).values({ id, contentType: file.type, data, size: file.size });
  return Response.json({ url: `/api/img/${id}` });
}
