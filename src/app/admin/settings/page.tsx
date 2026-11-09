import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettings() {
  await requireAdmin();
  const s = await getSettings();
  // Never send the saved SMTP password to the browser: the field shows a placeholder instead.
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <SettingsForm s={{ ...s, smtpPass: s.smtpPass ? "set" : "" }} />
    </div>
  );
}
