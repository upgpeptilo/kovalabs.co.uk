import Link from "next/link";

// Shoppers use guest checkout, so /account only explains that. The admin signs in at /auth/sign-in.
export default function Account() {
  return (
    <div className="wrap max-w-xl py-16 text-center">
      <h1 className="text-3xl font-bold">Account</h1>
      <p className="mt-3 text-muted">No account needed. Check out as a guest and we email your order confirmation. Questions about an order? <Link href="/contact" className="underline">Contact us</Link>.</p>
      <Link href="/store" className="btn btn-navy mt-6">Continue shopping</Link>
    </div>
  );
}
