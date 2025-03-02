/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "848t5ajmid.ufs.sh",
      pathname: "/f/*",
    },
  ],
};

export default config;
