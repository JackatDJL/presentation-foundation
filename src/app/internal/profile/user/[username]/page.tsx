"use client";

import { useParams } from "next/navigation";
import Maintenance from "~/components/maintanance";

export default function ProfileUserPage() {
  const params = useParams();
  const username = params.username as string;
  return <Maintenance debug={true} message={`/internal/profile/user/${username}`} />;
}
