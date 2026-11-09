"use server";
import { revalidatePath } from "next/cache";
import { db, settings } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { DEFAULTS, getSettings } from "@/lib/settings";
import { sendDiscord, sendMail } from "@/lib/notify";

// adminUserId is bound automatically at first admin sign-in, never from this form.
const KEYS = Object.keys(DEFAULTS).filter((k) => k !== "adminUserId") as (keyof typeof DEFAULTS)[];

export async function saveSettings(_: unknown, f: FormData): Promise<{ ok: boolean; msg: string }> {
  await requireAdmin();
  const current = await getSettings();
  const rows = KEYS.map((k) => {
    const d = DEFAULTS[k];
    let v: unknown;
    if (typeof d === "boolean") v = f.get(k) === "on";
    else if (typeof d === "number") v = Number(f.get(k)) || d;
    else {
      v = String(f.get(k) ?? "").trim();
      if (k === "smtpPass" && v === "") v = current.smtpPass; // blank = keep the saved password
    }
    return { key: k, value: { v } };
  });
  // One batched upsert for the whole form.
  await db.insert(settings).values(rows).onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
  revalidatePath("/", "layout");
  return { ok: true, msg: "Settings saved." };
}

export async function testDiscord(url: string): Promise<{ ok: boolean; msg: string }> {
  await requireAdmin();
  if (!/^https:\/\/(discord(app)?\.com)\/api\/webhooks\//.test(url)) return { ok: false, msg: "That doesn't look like a Discord webhook URL." };
  try { await sendDiscord(url, "Test message from your Kovalabs store."); return { ok: true, msg: "Test sent to Discord." }; }
  catch (e) { return { ok: false, msg: `Discord rejected it: ${(e as Error).message}` }; }
}

export async function testEmail(f: FormData): Promise<{ ok: boolean; msg: string }> {
  await requireAdmin();
  const s = await getSettings();
  const merged = {
    ...s, smtpHost: String(f.get("smtpHost") || ""), smtpPort: Number(f.get("smtpPort")) || 587, smtpUser: String(f.get("smtpUser") || ""),
    smtpPass: String(f.get("smtpPass") || "") || s.smtpPass, smtpFrom: String(f.get("smtpFrom") || ""),
  };
  const to = String(f.get("notifyEmails") || "").split(/[,\s]+/).filter(Boolean)[0];
  if (!merged.smtpHost || !merged.smtpFrom || !to) return { ok: false, msg: "Fill in SMTP host, From address and a notification email first." };
  try { await sendMail(merged, to, "Test email from your Kovalabs store", "SMTP is working."); return { ok: true, msg: `Test email sent to ${to}.` }; }
  catch (e) { return { ok: false, msg: `Could not send: ${(e as Error).message}` }; }
}
