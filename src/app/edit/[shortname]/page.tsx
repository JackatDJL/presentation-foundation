import { auth } from "@clerk/nextjs/server";
import { EditPage } from "./core";

export default async function Page() {
  const Auth = await auth.protect();

  return <EditPage userId={Auth.userId} />;
}
