import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { MobileMenu } from "@/components/MobileMenu";
import { SignOut } from "@/components/admin/SignOut";

export const metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/payments", label: "Payment methods" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/account", label: "Account" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line p-4 md:flex">
        <Link href="/admin" className="mb-4 text-xl font-bold">kovalabs admin</Link>
        <nav aria-label="Admin" className="flex-1 space-y-1">{NAV.map((n) => <Link key={n.href} href={n.href} className="flex min-h-11 items-center rounded-xl px-3 hover:bg-card">{n.label}</Link>)}</nav>
        <Link href="/" className="mb-2 text-sm underline">View store</Link>
        <SignOut />
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream px-3 md:hidden">
          <Link href="/admin" className="font-bold">kovalabs admin</Link>
          <MobileMenu groups={[{ title: "Admin", links: [...NAV, { href: "/", label: "View store" }] }]} extra={<SignOut />} />
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
