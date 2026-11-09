import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AgeGate } from "@/components/AgeGate";
import { LiveChat } from "@/components/LiveChat";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Kovalabs | UK Research Peptides | ISO 17025 Lab-Tested", template: "%s | Kovalabs" },
  description: "High-purity research peptides from the UK. Every batch HPLC-tested with a published certificate of analysis. For laboratory research use only.",
  openGraph: { images: ["/opengraph-image.jpeg"] },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const wa = s.whatsappNumber;
  return (
    <html lang="en" className={outfit.variable}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header announcement={s.announcement} />
          <main className="flex-1">{children}</main>
          <Footer s={s} />
        </CartProvider>
        <AgeGate />
        {s.whatsappFloating && s.whatsappNumber && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-navy fixed bottom-4 right-4 z-30 shadow-xl">WhatsApp us</a>
        )}
        {s.liveChatOn && s.liveChat && <LiveChat snippet={s.liveChat} />}
      </body>
    </html>
  );
}
