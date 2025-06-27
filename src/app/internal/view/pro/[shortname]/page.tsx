"use client";

import { useParams } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function ViewProPage() {
  const params = useParams();
  const shortname = params.shortname as string;
  return <Maintenance debug={true} message={`/internal/view/pro/${shortname}`} />;
}
