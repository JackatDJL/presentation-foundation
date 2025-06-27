"use client";

import { usePathname } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function HeroB2CPage() {
  return <Maintenance debug={true} message="/internal/hero/B2C" />;
}
