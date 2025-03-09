import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type React from "react";
import type { Metadata } from "next";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { ThemeProvider } from "~/components/theme-provider";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { TRPCReactProvider } from "~/trpc/react";

import { ClerkProvider } from "@clerk/nextjs";
import { extractRouterConfig } from "uploadthing/server";
import { UploadthingRouter } from "./api/uploadthing/core";
import { Toaster } from "~/components/ui/sonner";
import { dark } from "@clerk/themes";

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <Analytics />
          <SpeedInsights />
          <TRPCReactProvider>
            <NextSSRPlugin
              routerConfig={extractRouterConfig(UploadthingRouter)}
            />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
