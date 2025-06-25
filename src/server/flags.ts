import { flag } from "flags/next";
import { createPostHogAdapter } from "@flags-sdk/posthog";
import env from "#env";

const postHogAdapter = createPostHogAdapter({
  postHogKey: env.NEXT_PUBLIC_POSTHOG_KEY,
  postHogOptions: {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  },
});

export const devModeFlag = flag({
  key: "dev-mode",
  description: "Overwrites some difficult Stuff",
  defaultValue: false,
  decide() {
    return process.env.NODE_ENV === "development";
  },
});

export const kahootPopupFlag = flag({
  key: "kahoot-popup",
  description:
    "Enables a Popup which triggers when an opened presentation gets a Kahoot pin assigned",
  defaultValue: false,
  adapter: postHogAdapter.isFeatureEnabled(),
});

export const cmdkFlag = flag({
  key: "cmdk",
  description: "Enables the Command+K command menu",
  defaultValue: true,
  adapter: postHogAdapter.isFeatureEnabled(),
});
