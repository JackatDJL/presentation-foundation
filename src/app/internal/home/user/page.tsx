"use client";

import env from "#env";
import Maintenance from "~/components/maintanance";

export default function HomeUserPage() {
  return (
    <Maintenance
      debug={true}
      message={`/internal/home/user + ${env.NEXT_PUBLIC_HOST_URL}`}
    />
  );
}
