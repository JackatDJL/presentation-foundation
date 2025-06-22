import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type React from "react";
import type { Metadata } from "next";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { ThemeProvider } from "~/components/theme-provider";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";

import { TRPCReactProvider } from "~/trpc/react";

import { ClerkProvider } from "@clerk/nextjs";
import { extractRouterConfig } from "uploadthing/server";
import { UploadthingRouter } from "./api/uploadthing/core";
import { Toaster } from "~/components/ui/sonner";
import { dark } from "@clerk/themes";

// Implement Metadata Images TODO
export const metadata: Metadata = {
  title: "The Presentation Foundation - by DJL",
  description:
    "A Platform to host your Presentations on without the hasstle of logging in and hosting your files on a Cloud Service.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  generator: "Next.js",
  applicationName: "The Presentation Foundation",
  referrer: "origin-when-cross-origin",
  keywords: [
    "presentation",
    "foundation",
    "djl",
    "uploadthing",
    "cloud storage",
  ],
  authors: [{ name: "Jack Ruder", url: "https://jack.djl.foundation" }],
  creator: "JackatDJL",
  publisher: "The DJL Foundation",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "The Presentation Foundation - by DJL",
    description:
      "A Platform to host your Presentations on without the hasstle of logging in and hosting your files on a Cloud Service.",
    url: "https://presentation.djl.foundation",
    type: "website",
    locale: "en_US",
    siteName: "The Presentation Foundation",
    images: [
      {
        url: "/img/og.png",
        width: 1200,
        height: 630,
        alt: "The Presentation Foundation - by DJL",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    site: "@JackatDJL",
    title: "The Presentation Foundation - by DJL",
    description:
      "A Platform to host your Presentations on without the hasstle of logging in and hosting your files on a Cloud Service.",
    images: {
      url: "/img/og.png",
      width: 1200,
      height: 630,
      alt: "The Presentation Foundation - by DJL",
    },
  },
  category: "Internet",
  classification: "Presentation Foundation",
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
