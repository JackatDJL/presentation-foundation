import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const internalHeader = headerList.get("x-internal-no-evict");

  if (internalHeader !== "true") {
    redirect("/");
  }

  return <>{children}</>;
}
