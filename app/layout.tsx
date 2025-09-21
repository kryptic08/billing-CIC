import type { Metadata } from "next";
import { Inter_Tight, Roboto } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    // Always prioritize production URL for deployed versions
    process.env.NODE_ENV === "production"
      ? "https://dw.kirbycope.com"
      : process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://dw.kirbycope.com")
  ),
  title: "Billing and Insurance CIC",
  description: "AI-powered billing and insurance claims management",
  icons: {
    icon: "/cloud.svg",
  },
  openGraph: {
    title: "Billing and Insurance CIC",
    description: "AI-powered billing and insurance claims management",
    siteName: "Billing and Insurance CIC",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Billing and Insurance CIC - AI-powered healthcare management",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Billing and Insurance CIC",
    description: "AI-powered billing and insurance claims management",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${interTight.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
