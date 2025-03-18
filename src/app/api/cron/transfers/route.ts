import { NextResponse } from "next/server";
import { api } from "~/trpc/server";

export async function GET(req: Request) {
  if (
    process.env.NODE_ENV !== "development" &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await api.files.transfers.run();
  return NextResponse.json({ success: true });
}
