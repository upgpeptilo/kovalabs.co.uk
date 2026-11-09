"use client";
import { useActionState, useRef, useState } from "react";
import { FormSwitch } from "@/components/admin/Switches";
import { PhoneField } from "@/components/admin/PhoneField";
import type { Settings } from "@/lib/settings";
import { saveSettings, testDiscord, testEmail } from "./actions";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3 rounded-2xl border border-line bg-white/60 p-4"><h2 className="text-lg font-bold">{title}</h2>{children}</section>
);
const Text = ({ name, label, s, type = "text", ...rest }: { name: keyof Settings; label: string; s: Settings; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={String(s[name] ?? "")} className="field" {...rest} /></div>
);

export function SettingsForm({ s }: { s: Settings }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  const form = useRef<HTMLFormElement>(null);
  const [test, setTest] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; msg: string }>) {
    setBusy(true); setTest(null);
    try { setTest(await fn()); } catch { setTest({ ok: false, msg: "Something went wrong." }); }
    setBusy(false);
  }

  return (
    <form ref={form} action={action} className="space-y-5 pb-28">
      <Section title="Store">
        <Text name="storeName" label="Store name" s={s} />
        <Text name="tagline" label="Tagline (footer)" s={s} />
        <Text name="announcement" label="Announcement banner (separate messages with ·)" s={s} />
        <div className="grid gap-3 sm:grid-cols-2"><Text name="phone" label="Phone" s={s} /><Text name="email" label="Public email" type="email" s={s} /></div>
        <Text name="companyLine" label="Company line (footer)" s={s} />
        <Text name="freeDeliveryOver" label="Free delivery over (£)" type="number" s={s} />
      </Section>

      <Section title="Address & map">
        <Text name="address" label="Store address" s={s} />
        <FormSwitch name="showMap" label="Show map on contact page" hint="Google Maps embed, no API key needed." defaultChecked={s.showMap} />
      </Section>

      <Section title="WhatsApp">
        <PhoneField name="whatsappNumber" label="WhatsApp number" defaultValue={s.whatsappNumber} />
        <FormSwitch name="whatsappFloating" label="Floating WhatsApp button" defaultChecked={s.whatsappFloating} />
        <FormSwitch name="orderByWhatsapp" label="Let customers order by WhatsApp" defaultChecked={s.orderByWhatsapp} />
      </Section>

      <Section title="Text message (SMS)">
        <PhoneField name="smsNumber" label="Text message number" defaultValue={s.smsNumber} />
        <FormSwitch name="orderBySms" label="Let customers order by text" defaultChecked={s.orderBySms} />
      </Section>

      <Section title="Live chat">
        <div><label className="label" htmlFor="liveChat">Provider snippet</label><textarea id="liveChat" name="liveChat" rows={4} defaultValue={s.liveChat} className="field font-mono text-xs" /></div>
        <FormSwitch name="liveChatOn" label="Live chat on" defaultChecked={s.liveChatOn} />
      </Section>

      <Section title="Discord">
        <Text name="discordWebhook" label="Webhook URL" s={s} />
        <button type="button" disabled={busy} className="btn btn-line" onClick={() => run(() => testDiscord(String(new FormData(form.current!).get("discordWebhook") || "")))}>Send test</button>
      </Section>

      <Section title="Email (SMTP)">
        <FormSwitch name="orderByEmail" label="Let customers order by email" defaultChecked={s.orderByEmail} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text name="smtpHost" label="Host" s={s} /><Text name="smtpPort" label="Port" type="number" s={s} />
          <Text name="smtpUser" label="User" s={s} autoComplete="off" />
          <div><label className="label" htmlFor="smtpPass">Password</label><input id="smtpPass" name="smtpPass" type="password" autoComplete="new-password" placeholder={s.smtpPass ? "(saved, leave blank to keep)" : ""} className="field" /></div>
        </div>
        <Text name="smtpFrom" label="From address" s={s} />
        <Text name="notifyEmails" label="Send order notifications to (comma separated)" s={s} />
        <button type="button" disabled={busy} className="btn btn-line" onClick={() => run(() => testEmail(new FormData(form.current!)))}>Send test email</button>
      </Section>

      {test && <p role="status" className={`rounded-xl p-3 text-sm ${test.ok ? "bg-ok/10 text-ok" : "bg-accent/10 text-accent"}`}>{test.msg}</p>}

      {/* Sticky so Save is always reachable and the confirmation is always visible. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-3 backdrop-blur md:left-56">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <p role="status" aria-live="polite" className={`text-sm font-semibold ${state?.ok ? "text-ok" : "text-muted"}`}>{pending ? "Saving…" : state?.msg ?? "Unsaved changes are lost if you leave."}</p>
          <button type="submit" disabled={pending} className="btn btn-navy">Save settings</button>
        </div>
      </div>
    </form>
  );
}
