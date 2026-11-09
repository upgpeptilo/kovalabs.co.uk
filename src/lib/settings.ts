import { db, settings } from "@/db";

// One place for every setting + its default. Adding a setting = adding a key here.
export const DEFAULTS = {
  storeName: "Kovalabs",
  tagline: "Independent UK supplier of high-purity research peptides. Every batch HPLC-tested, cold-chain stored, and dispatched same-day from our Greater London facility.",
  announcement: "Order by 3pm - dispatched today · Free 24-hour delivery over £75",
  email: "team@kovalabs.co.uk",
  phone: "",
  address: "Floww Group Limited, 66 Paul Street, London, EC2A 4NE",
  showMap: false,
  companyLine: "Kovalabs is a trading name of Floww Group Ltd, registered in England & Wales, company no. 15986643.",
  freeDeliveryOver: 75,
  whatsappNumber: "", // digits only, country code included
  whatsappFloating: false,
  orderByWhatsapp: false,
  smsNumber: "",
  orderBySms: false,
  orderByEmail: true,
  liveChat: "",
  liveChatOn: false,
  discordWebhook: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  notifyEmails: "team@kovalabs.co.uk",
  adminUserId: "", // bound on first admin sign-in (see lib/admin.ts); not editable in Settings
};
export type Settings = typeof DEFAULTS;

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(settings);
  const out: Record<string, unknown> = { ...DEFAULTS };
  for (const r of rows) if (r.key in DEFAULTS) out[r.key] = r.value.v;
  return out as Settings;
}
