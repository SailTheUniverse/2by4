import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "2by4 — Compare construction material prices", template: "%s · 2by4" },
  description:
    "Find the best price on lumber, electrical, plumbing and tools across Home Depot, Lowe's, Menards, Ace, Harbor Freight and Amazon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted sm:px-6">
            <p>
              <strong className="text-ink">Draft build:</strong> prices and stock are simulated sample data, not
              live retailer prices. Retailer names are used for comparison only; 2by4 isn&apos;t affiliated with them.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
