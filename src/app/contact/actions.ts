"use server";
import { getSettings } from "@/lib/settings";
import { sendMail, smtpReady } from "@/lib/notify";

export async function sendContact(_: unknown, f: FormData): Promise<{ ok: boolean; msg: string }> {
  if (f.get("website")) return { ok: true, msg: "Thanks, message sent." }; // honeypot: bots fill this hidden field
  const email = String(f.get("email") || "").trim(), message = String(f.get("message") || "").trim(), topic = String(f.get("topic") || "Something else");
  if (!/^\S+@\S+\.\S+$/.test(email) || message.length < 5 || message.length > 5000) return { ok: false, msg: "Please enter a valid email and a message." };
  const s = await getSettings();
  if (!smtpReady(s)) return { ok: false, msg: `We can't send messages from this form right now. Please email ${s.email} directly.` };
  try {
    await sendMail(s, s.notifyEmails.split(/[,\s]+/).filter(Boolean).join(",") || s.email, `Contact form: ${topic}`, `From: ${email}\nTopic: ${topic}\n\n${message}`);
    return { ok: true, msg: "Thanks, message sent. We reply within one working day." };
  } catch {
    return { ok: false, msg: `Sorry, that didn't send. Please email ${s.email} directly.` };
  }
}
