import { oAuthDiscoveryMetadata } from "better-auth/plugins";
import auth from "#auth";

export const GET = oAuthDiscoveryMetadata(auth);
