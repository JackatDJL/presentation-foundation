import { auth } from "@clerk/nextjs/server";
import ManagePresentations from "./core";
import { api } from "~/trpc/server";

export default async function ManagePage() {
  const user = await auth.protect();
  const presentation = await api.recent.pullByUID({
    uid: user.userId,
  });

  return <ManagePresentations presentation={presentation} />;
}
