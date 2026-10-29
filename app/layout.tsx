import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://basswoodcreative.com"),
  title: {
    default: "Basswood Creative — Agentic engineering for software teams",
    template: "%s — Basswood Creative",
  },
  description:
    "Agentic engineering for software teams: a two-week, fixed-fee review of how your team uses coding agents, with the top fixes shipped as a pull request.",
  openGraph: {
    type: "website",
    siteName: "Basswood Creative",
    url: "https://basswoodcreative.com",
    title: "Basswood Creative — Agentic engineering for software teams",
    description:
      "Agentic engineering for software teams: a two-week, fixed-fee review of how your team uses coding agents, with the top fixes shipped as a pull request.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basswood Creative — Agentic engineering for software teams",
    description: "Your team has the coding agents. I make them pay off.",
  },
  alternates: {
    types: {
      "application/rss+xml": "https://basswoodcreative.com/rss.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0908" },
    { color: "#ECEDEF" },
  ],
};

// Runs before paint: saved choice wins, OS preference otherwise. The manual
// toggle (B4 nav) writes localStorage("mode") and flips the same attribute.
const themeInit = `try{var m=localStorage.getItem("mode")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.mode=m}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${bricolage.variable} ${plexMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
