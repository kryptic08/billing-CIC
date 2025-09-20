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
  title: "Biling and Insurance CIC",
  description: "AI-powered billing and insurance claims management",
  icons: {
    icon: "/cloud.svg",
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
