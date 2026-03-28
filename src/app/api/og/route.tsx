import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/queries/projects";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap",
  ).then((res) => res.text());

  const fontUrl = fontData.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];

  const font = fontUrl
    ? await fetch(fontUrl).then((res) => res.arrayBuffer())
    : null;

  const data = slug ? await getProjectBySlug(slug) : null;
  const project = data?.project ?? null;

  if (!project) {
    // Fallback: generic WhatHome branded image
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAFAFA",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #000",
            padding: "40px 60px",
            backgroundColor: "#fff",
            boxShadow: "6px 6px 0px #000",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#000",
              fontFamily: "Space Grotesk",
            }}
          >
            WhatHome
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#555",
              marginTop: 12,
              fontFamily: "Space Grotesk",
            }}
          >
            Singapore New Condo Launch Research
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
        ...(font
          ? {
              fonts: [
                {
                  name: "Space Grotesk",
                  data: font,
                  weight: 700 as const,
                  style: "normal" as const,
                },
              ],
            }
          : {}),
      },
    );
  }

  // Get PSF range from unit mix
  const units = data?.units ?? [];
  const psfValues = units.map((u) => u.pricePsf).filter(Boolean);
  const psfMin = psfValues.length ? Math.min(...psfValues) : null;
  const psfMax = psfValues.length ? Math.max(...psfValues) : null;
  const psfRange =
    psfMin && psfMax
      ? `$${psfMin.toLocaleString()} – $${psfMax.toLocaleString()} psf`
      : null;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#FAFAFA",
        padding: 48,
      }}
    >
      {/* Main card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: "3px solid #000",
          backgroundColor: "#fff",
          boxShadow: "8px 8px 0px #000",
          padding: 48,
        }}
      >
        {/* Project name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#000",
            fontFamily: "Space Grotesk",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </div>

        {/* Badges row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            marginTop: 24,
          }}
        >
          {/* District badge */}
          <div
            style={{
              display: "flex",
              border: "2px solid #000",
              padding: "6px 16px",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              backgroundColor: "#E5E5E5",
            }}
          >
            D{project.districtNumber}
          </div>

          {/* Region badge */}
          <div
            style={{
              display: "flex",
              border: "2px solid #000",
              padding: "6px 16px",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              backgroundColor:
                project.region === "CCR"
                  ? "#FDE68A"
                  : project.region === "RCR"
                    ? "#BBF7D0"
                    : "#BFDBFE",
            }}
          >
            {project.region}
          </div>

          {/* Tenure badge */}
          <div
            style={{
              display: "flex",
              border: "2px solid #000",
              padding: "6px 16px",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              backgroundColor: "#fff",
            }}
          >
            {project.tenure}
          </div>
        </div>

        {/* PSF range */}
        {psfRange && (
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              color: "#000",
              fontFamily: "Space Grotesk",
              marginTop: 32,
            }}
          >
            {psfRange}
          </div>
        )}

        {/* Units + TOP */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            marginTop: 16,
            fontSize: 24,
            color: "#555",
            fontFamily: "Space Grotesk",
          }}
        >
          <div style={{ display: "flex" }}>{project.totalUnits} units</div>
          <div style={{ display: "flex" }}>TOP {project.topDate}</div>
          <div style={{ display: "flex" }}>{project.developerName}</div>
        </div>
      </div>

      {/* Branding bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 16,
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "Space Grotesk",
          color: "#000",
        }}
      >
        WhatHome
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
      ...(font
        ? {
            fonts: [
              {
                name: "Space Grotesk",
                data: font,
                weight: 700 as const,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    },
  );
}
