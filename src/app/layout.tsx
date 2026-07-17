import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClientProviders } from "./client-providers";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: "VeriField — Zero-Trust Field Verification",
    template: "%s | VeriField",
  },
  description:
    "Court-admissible field verification for African elections and corporate field operations.",
  icons: {
    icon: "/favicon.png",
    apple: "/verifield-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("font-sans", inter.variable)}
    >
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
