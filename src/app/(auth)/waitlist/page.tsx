"use client";
import { Waitlist } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function Page() {
  const theme = useTheme();
  const theTheme = theme.theme !== "light" ? dark : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <Waitlist appearance={{ baseTheme: theTheme }} />
      </div>
    </main>
  );
}
