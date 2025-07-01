"use client";

import posthog from "posthog-js";
import env from "#env";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, use, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import authClient from "#auth/client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We capture pageviews manually
      capture_pageleave: true, // Enable pageleave capture
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const session = use(authClient.getSession());

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += "?" + search;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  useEffect(() => {
    // 👉 Check the sign-in status and user info,
    //    and identify the user if they aren't already
    if (session.data && !posthog._isIdentified()) {
      // 👉 Identify the user
      posthog.identify(session.data.user.id, {
        email: session.data.user.email,
        name: session.data.user.name,
        username: session.data.user.username,
      });
    }

    if (!session.data && posthog._isIdentified()) {
      posthog.reset();
    }
  }, [posthog, session.data]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
