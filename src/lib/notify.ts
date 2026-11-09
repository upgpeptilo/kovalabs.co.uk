import nodemailer from "nodemailer";
import type { Settings } from "./settings";
import { gbp } from "./format";

export type OrderLike = {
  number: string; name: string; email: string; phone: string; address: string; notes: string;
  items: { name: string; label: string; qty: number; pricePence: number }[];
  totalPence: number; paymentMethodName: string; channel: string;
};

export function orderText(o: OrderLike, siteUrl = "") {
  const lines = o.items.map((i) => `${i.qty} x ${i.name}${i.label && i.label !== "Standard" ? ` (${i.label})` : ""} - ${gbp(i.pricePence * i.qty)}`);
  const optional = (label: string, v: string) => (v ? [`${label}: ${v}`] : []);
  return [
    `New order ${o.number}`, "", ...lines, "", `Total: ${gbp(o.totalPence)}`, `Payment: ${o.paymentMethodName}`, "",
    `Name: ${o.name}`, `Email: ${o.email}`, ...optional("Phone", o.phone), ...optional("Address", o.address), ...optional("Notes", o.notes),
    ...(siteUrl ? ["", `${siteUrl}/admin/orders`] : []),
  ].join("\n");
}

const transport = (s: Settings) =>
  nodemailer.createTransport({ host: s.smtpHost, port: Number(s.smtpPort), secure: Number(s.smtpPort) === 465, auth: s.smtpUser ? { user: s.smtpUser, pass: s.smtpPass } : undefined });

export const smtpReady = (s: Settings) => Boolean(s.smtpHost && s.smtpFrom);

export async function sendMail(s: Settings, to: string, subject: string, text: string) {
  await transport(s).sendMail({ from: s.smtpFrom, to, subject, text });
}

export async function sendDiscord(url: string, content: string) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: content.slice(0, 1900) }) });
  if (!r.ok) throw new Error(`Discord ${r.status}`);
}

// Notification failures are swallowed on purpose: they must never fail the order.
export async function notifyOrder(s: Settings, o: OrderLike, siteUrl: string, emailCustomer: boolean) {
  const text = orderText(o, siteUrl);
  const jobs: Promise<unknown>[] = [];
  if (s.discordWebhook) jobs.push(sendDiscord(s.discordWebhook, text));
  if (smtpReady(s)) {
    const admins = s.notifyEmails.split(/[,\s]+/).filter(Boolean);
    if (admins.length) jobs.push(sendMail(s, admins.join(","), `New order ${o.number}`, text));
    if (emailCustomer) jobs.push(sendMail(s, o.email, `Your Kovalabs order ${o.number}`, `Thanks for your order.\n\n${text}\n\nWe will email you payment details shortly. Products are for laboratory research use only.`));
  }
  await Promise.allSettled(jobs);
}
