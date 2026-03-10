import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Great Soup Feast",
  description: "An annual soup competition — taste, vote, celebrate.",
};

function SiteHeader() {
  return (
    <header className="border-b border-sand">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 text-xs tracking-[0.2em] uppercase text-taupe">
          <span>Est. 2024</span>
          <span>A Communal Tradition</span>
        </div>

        {/* Masthead */}
        <div className="border-t border-sand py-6 text-center">
          <Link href="/" className="inline-block no-underline">
            <h1
              className="text-4xl font-bold tracking-tight text-espresso sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              The Great Soup Feast
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="border-t border-sand">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 py-3 text-xs tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            <li>
              <Link href="/signup" className="text-espresso hover:text-wine transition-colors no-underline">
                Register a Soup
              </Link>
            </li>
            <li>
              <Link href="/rsvp" className="text-espresso hover:text-wine transition-colors no-underline">
                RSVP
              </Link>
            </li>
            <li>
              <Link href="/ideas" className="text-espresso hover:text-wine transition-colors no-underline">
                Soup Ideas
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="text-espresso hover:text-wine transition-colors no-underline">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/results" className="text-espresso hover:text-wine transition-colors no-underline">
                Results
              </Link>
            </li>
            <li>
              <Link href="/archive" className="text-espresso hover:text-wine transition-colors no-underline">
                Archive
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-sand mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12 text-center">
        <p
          className="text-2xl font-bold text-espresso mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          The Great Soup Feast
        </p>
        <p className="text-sm text-taupe mb-6" style={{ fontFamily: "var(--font-lora)" }}>
          Good soup brings good people together.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs tracking-[0.15em] uppercase text-taupe">
          <Link href="/signup" className="hover:text-espresso transition-colors no-underline">Register</Link>
          <Link href="/rsvp" className="hover:text-espresso transition-colors no-underline">RSVP</Link>
          <Link href="/ideas" className="hover:text-espresso transition-colors no-underline">Ideas</Link>
          <Link href="/archive" className="hover:text-espresso transition-colors no-underline">Archive</Link>
          <Link href="/admin" className="hover:text-espresso transition-colors no-underline">Admin</Link>
        </div>
        <div className="mt-8 text-xs text-mushroom">
          ◆
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: "var(--font-lora)" }}
      >
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
