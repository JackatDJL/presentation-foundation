import { auth } from "@clerk/nextjs/server";
import { CreatePage } from "./core";

export default async function Page() {
  const Auth = await auth.protect();

  return <CreatePage userId={Auth.userId} />;
}
