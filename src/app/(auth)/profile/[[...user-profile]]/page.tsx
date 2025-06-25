"use client";
import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function Page() {
  const theme = useTheme();
  const theTheme = theme.theme !== "light" ? dark : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <UserProfile
          appearance={{
            baseTheme: theTheme,
          }}
        />
      </div>
    </main>
  );
}
