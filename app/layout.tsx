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
    default: "Basswood Creative — Protocol-grade frontends",
    template: "%s — Basswood Creative",
  },
  description:
    "Frontend consultancy for teams whose interfaces carry real user funds — dApps, governance portals, on-chain position management, and LLM integrations. Built on eight years inside MakerDAO / Sky Protocol.",
  openGraph: {
    type: "website",
    siteName: "Basswood Creative",
    url: "https://basswoodcreative.com",
    title: "Basswood Creative — Protocol-grade frontends",
    description:
      "Frontend consultancy for teams whose interfaces carry real user funds — dApps, governance portals, on-chain position management, and LLM integrations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basswood Creative — Protocol-grade frontends",
    description:
      "Frontend consultancy for teams whose interfaces carry real user funds.",
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
