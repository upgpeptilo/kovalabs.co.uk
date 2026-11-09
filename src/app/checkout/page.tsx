import { checkoutInfo } from "@/lib/cart-actions";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function Checkout() {
  const { methods, channels } = await checkoutInfo();
  if (!methods.length || !channels.length) {
    return <div className="wrap py-20 text-center"><h1 className="text-3xl font-bold">Checkout isn&apos;t available</h1><p className="mt-2 text-muted">Please contact us to place your order.</p></div>;
  }
  return <CheckoutForm methods={methods.map(({ id, name, image, instructions }) => ({ id, name, image, instructions }))} channels={channels} />;
}
