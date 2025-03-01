import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
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
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
