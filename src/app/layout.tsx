import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme";
import { siteUrl } from "@/lib/env";

// Editorial serif for display (A24 / fashion-brand feel) + clean grotesk for UI.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "hejsöt",
    template: "%s · hejsöt",
  },
  description:
    "A quietly beautiful way to ask someone out. Make a personal invite, send one link, wait for the yes.",
  openGraph: {
    title: "hejsöt",
    description:
      "A quietly beautiful way to ask someone out. One link. One question. One yes.",
    type: "website",
    locale: "sv_SE",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0c11" },
    { media: "(prefers-color-scheme: light)", color: "#fcfafb" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sv"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Set theme before paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
