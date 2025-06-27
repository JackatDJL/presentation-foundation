"use client";

import { useParams } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function ProfileOrgPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  return <Maintenance debug={true} message={`/internal/profile/org/${orgSlug}`} />;
}
