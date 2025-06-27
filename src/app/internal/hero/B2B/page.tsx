"use client";

import { usePathname } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function HeroB2BPage() {
  return <Maintenance debug={true} message="/internal/hero/B2B" />;
}
