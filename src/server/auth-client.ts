import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  oneTapClient,
  passkeyClient,
  usernameClient,
  organizationClient,
} from "better-auth/client/plugins";
import env from "#env";
import { ac, user, proUser, admin } from "./permisions";

const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    passkeyClient(),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
    }),
    adminClient({
      ac,
      roles: {
        admin,
        user,
        proUser,
      },
    }),
    organizationClient(),
  ],
});

export default authClient;
