"use client";

import { usePathname } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function HomeUserPage() {
  return <Maintenance debug={true} message="/internal/home/user" />;
}
