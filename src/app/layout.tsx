import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type React from "react"
import type { Metadata } from "next"
import Header from "~/components/header"
import Footer from "~/components/footer"
import { ThemeProvider } from "~/components/theme-provider"

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Presentation - Foundation - by DJL",
  description:
    "A Platform to host your Presentations on without the hasstle of logging in and hosting your files on a Cloud Service.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Analytics />
        <SpeedInsights />
        <TRPCReactProvider><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider></TRPCReactProvider>
      </body>
    </html>
  );
}
