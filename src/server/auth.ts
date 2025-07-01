import { betterAuth } from "better-auth";
import {
  oneTap,
  username,
  admin as adminPlugin,
  mcp,
  organization,
  haveIBeenPwned,
  oAuthProxy,
  openAPI,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "#db";
import env from "#env";
import { forbiddenNames } from "../lib/constants";
import { ac, admin, proUser, user } from "./permisions";
import { legalConsent } from "@better-auth-kit/legal-consent";
import { nextCookies } from "better-auth/next-js";

const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      enabled: true,
      clientId: env.GITHUB_AUTH_CLIENT_ID,
      clientSecret: env.GITHUB_AUTH_CLIENT_SECRET,
    },
    google: {
      enabled: true,
      clientId: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
    },
  },
  plugins: [
    username({
      maxUsernameLength: 20,
      minUsernameLength: 3,
      usernameValidator(username) {
        if (forbiddenNames.includes(username)) {
          return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          return false;
        }
        return true;
      },
    }),
    passkey({
      rpID: "presentation-foundation",
      rpName: "The Presentation Foundation",
      origin: env.HOST_URL,
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform", // Use platform for platform authenticators
        residentKey: "preferred", // Encourage credential storage but not mandatory
        userVerification: "preferred", // Encourage user verification but not mandatory
      },
    }),
    oneTap(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
        proUser,
      },
    }),
    mcp({
      loginPage: "/sign-in",
    }),
    organization(),
    haveIBeenPwned(),
    oAuthProxy({
      productionURL: "pr.djl.foundation",
      currentURL: env.HOST_URL,
    }),
    openAPI(),
    legalConsent({
      requireTOS: true,
      requirePrivacyPolicy: true,
      requireMarketingConsent: true,
      requireCookieConsent: true,
    }),
    nextCookies(),
  ],
});

export default auth;
