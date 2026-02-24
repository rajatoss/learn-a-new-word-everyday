import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learn A New Word Everyday",
  description:
    "Expand your vocabulary one word at a time. A new English word every day with definitions, pronunciation, and examples.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#FAF8F5] text-[#1F2937] font-sans antialiased min-h-screen">
        <header className="border-b border-[#E5E0D8]">
          <nav className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl font-bold text-[#1B365D] hover:opacity-80 transition-opacity"
            >
              Learn A New Word
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-[#6B7280] hover:text-[#1B365D] transition-colors"
              >
                Today
              </Link>
              <Link
                href="/archive"
                className="text-sm text-[#6B7280] hover:text-[#1B365D] transition-colors"
              >
                Archive
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t border-[#E5E0D8] mt-16">
          <div className="max-w-3xl mx-auto px-6 py-6 text-center text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} Learn A New Word Everyday. Built with love for language.
          </div>
        </footer>
      </body>
    </html>
  );
}
