// .storybook/decorators.tsx
import React from "react";
import { ThemeProvider } from "../src/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

export const withTheme = (StoryFn: any) => {
  return (
    <ThemeProvider>
      <StoryFn />
    </ThemeProvider>
  );
};

export const withAuth = (StoryFn: any) => {
  // clerkMiddleware(); // Remove this line

  return (
    <ClerkProvider>
      <StoryFn />
    </ClerkProvider>
  );
};
