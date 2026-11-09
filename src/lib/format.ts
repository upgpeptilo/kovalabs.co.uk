export const gbp = (pence: number) => `£${(pence / 100).toFixed(2)}`;

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
