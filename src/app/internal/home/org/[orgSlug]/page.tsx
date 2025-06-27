"use client";

import { useParams } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function HomeOrgPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  return <Maintenance debug={true} message={`/internal/home/org/${orgSlug}`} />;
}
