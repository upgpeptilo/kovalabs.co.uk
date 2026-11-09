import Link from "next/link";
import { db, posts } from "@/db";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export default async function AdminBlog() {
  await requireAdmin();
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Blog</h1><Link href="/admin/blog/new" className="btn btn-navy">New post</Link></div>
      {rows.length === 0 ? <p className="mt-6 text-muted">No posts yet.</p> : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((p) => (
            <li key={p.id}><Link href={`/admin/blog/${p.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 hover:bg-card"><strong>{p.title}</strong><span className="text-xs text-muted">{p.layout}{!p.published && " · draft"}</span></Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
