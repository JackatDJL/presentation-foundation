/* eslint-disable @next/next/no-img-element */
import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // Use the theme search param to toggle dark mode
  const darkMode = searchParams.get("theme") === "dark";
  const locale = (await headers()).get("accept-language");
  const shortname = searchParams.get("shortname");

  if (!shortname) {
    return new NextResponse("No shortname provided", {
      status: 403,
    });
  }

  const data = await api.presentations.getByShortname(shortname);
  if (!data) {
    return new NextResponse("Presentation not found", {
      status: 404,
    });
  }

  const logo = data.files.find((file) => file.id === data.logoId)?.url ?? null;
  const cover =
    data.files.find((file) => file.id === data.coverId)?.url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex", // IMPORTANT: Must be explicitly set
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: darkMode ? "#1f2937" : "white",
          borderRadius: "24px",
          overflow: "hidden",
          border: `2px solid ${darkMode ? "white" : "black"}`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Top image section */}
        {cover ? (
          <div style={{ display: "flex", height: "350px", width: "100%" }}>
            <img
              src={cover || "/placeholder.svg"}
              alt="Cover Image"
              width={1200}
              height={350}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                backgroundColor: darkMode ? "#374151" : "#f0f0f0",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              height: "350px",
              width: "100%",
              backgroundColor: darkMode ? "#374151" : "#f0f0f0",
            }}
          />
        )}

        {/* Content section */}
        <div
          style={{
            display: "flex",
            padding: "24px",
            alignItems: "center",
            justifyContent: "space-between",
            flexGrow: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Logo circle */}
            {logo && (
              <div style={{ display: "flex" }}>
                <img
                  src={logo || "/placeholder.svg"}
                  alt={data.title}
                  width={100}
                  height={100}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: darkMode ? "#121212" : "#f0f0f0",
                  }}
                />
              </div>
            )}

            {/* Title and description */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: darkMode ? "#ffffff" : "#000000",
                }}
              >
                {data.title}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  color: darkMode ? "#bbbbbb" : "#666666",
                }}
              >
                {data.description ?? "No description provided"}
              </div>
            </div>
          </div>

          {/* Last update */}
          <div
            style={{
              fontSize: "24px",
              color: darkMode ? "#bbbbbb" : "#666666",
            }}
          >
            {data.updatedAt
              ? `Last update: ${new Date(data.updatedAt).toLocaleDateString(locale ? locale.split(",")[0] : undefined)}`
              : ""}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            borderTop: `1px solid ${darkMode ? "#4b5563" : "#eaeaea"}`,
            fontSize: "20px",
            color: darkMode ? "#9ca3af" : "#666",
            backgroundColor: darkMode ? "#111827" : "inherit",
          }}
        >
          CC {new Date().getFullYear()} @DJL Foundation
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export const config = {
  runtime: "edge",
};
