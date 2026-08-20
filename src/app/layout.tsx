import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TabBar } from "@/components/TabBar";
import { Providers } from "@/components/Providers";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Rentaly · Alquila con tranquilidad en Madrid",
    template: "%s · Rentaly",
  },
  description:
    "Transparencia para inquilinos en Madrid capital: Catastro, 131 barrios y memoria vecinal para contrastar un anuncio antes de firmar.",
  appleWebApp: {
    capable: true,
    title: "Rentaly",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4efe4",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} font-sans min-h-screen antialiased`}>
        <Providers>
          <div className="pb-24 md:pb-0">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
