import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db, settings } from "@/db";
import { getSettings } from "@/lib/settings";

// The admin is bound to a stable user id: the first sign-in whose email equals ADMIN_EMAIL claims it.
// After that the login email can change freely without locking the admin out.
export async function getAdmin() {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user) return null;
  const { adminUserId } = await getSettings();
  if (adminUserId) return user.id === adminUserId ? user : null;
  if (!process.env.ADMIN_EMAIL || user.email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) return null;
  await db.insert(settings).values({ key: "adminUserId", value: { v: user.id } }).onConflictDoNothing();
  return user;
}

// Call at the top of every admin page and server action (the layout alone does not re-run for actions).
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/auth/sign-in");
  return user;
}
