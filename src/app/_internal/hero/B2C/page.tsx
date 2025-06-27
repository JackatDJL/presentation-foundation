"use client";

import { usePathname } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function HeroB2CPage() {
  const pathname = usePathname();
  return <Maintenance debug={true} message={pathname} />;
}
