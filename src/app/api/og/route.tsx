import { ImageResponse } from "next/og";
import { getDeveloperBySlug } from "@/lib/queries/developers";
import { getDistrictByNumber } from "@/lib/queries/districts";
import { getProjectBySlug } from "@/lib/queries/projects";

const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

async function loadFont() {
  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap",
  ).then((res) => res.text());

  const fontUrl = fontData.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];

  const font = fontUrl
    ? await fetch(fontUrl).then((res) => res.arrayBuffer())
    : null;

  return font
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
    : {};
}

function BrandedFallback({ subtitle }: { subtitle: string }) {
  return (
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
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function BrandingBar() {
  return (
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
  );
}

function Badge({ label, bg = "#E5E5E5" }: { label: string; bg?: string }) {
  return (
    <div
      style={{
        display: "flex",
        border: "2px solid #000",
        padding: "6px 16px",
        fontSize: 22,
        fontWeight: 700,
        fontFamily: "Space Grotesk",
        backgroundColor: bg,
      }}
    >
      {label}
    </div>
  );
}

const REGION_COLOURS: Record<string, string> = {
  CCR: "#FDE68A",
  RCR: "#BBF7D0",
  OCR: "#BFDBFE",
};

async function renderProject(slug: string, fontConfig: object) {
  const data = await getProjectBySlug(slug);
  const project = data?.project ?? null;

  if (!project) {
    return new ImageResponse(
      <BrandedFallback subtitle="Singapore New Condo Launch Research" />,
      { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
    );
  }

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

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Badge label={`D${project.districtNumber}`} />
          <Badge
            label={project.region ?? ""}
            bg={REGION_COLOURS[project.region ?? ""] ?? "#E5E5E5"}
          />
          <Badge label={project.tenure ?? ""} />
        </div>

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

      <BrandingBar />
    </div>,
    { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
  );
}

async function renderDeveloper(slug: string, fontConfig: object) {
  const data = await getDeveloperBySlug(slug);

  if (!data) {
    return new ImageResponse(
      <BrandedFallback subtitle="Developer Directory" />,
      { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
    );
  }

  const { developer } = data;

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: "3px solid #000",
          backgroundColor: "#fff",
          boxShadow: "8px 8px 0px #000",
          padding: 48,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#555",
            fontFamily: "Space Grotesk",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          Developer
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#000",
            fontFamily: "Space Grotesk",
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {developer.name}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            marginTop: 32,
            fontSize: 24,
            color: "#555",
            fontFamily: "Space Grotesk",
          }}
        >
          <div style={{ display: "flex" }}>
            {developer.projectCount} projects
          </div>
          <div style={{ display: "flex" }}>
            {developer.totalUnits.toLocaleString()} units
          </div>
        </div>
      </div>

      <BrandingBar />
    </div>,
    { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
  );
}

async function renderDistrict(number: string, fontConfig: object) {
  const districtNum = Number.parseInt(number, 10);
  const data = await getDistrictByNumber(districtNum);

  if (!data) {
    return new ImageResponse(<BrandedFallback subtitle="District Browser" />, {
      width: 1200,
      height: 630,
      headers: CACHE_HEADERS,
      ...fontConfig,
    });
  }

  const { district } = data;

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: "3px solid #000",
          backgroundColor: "#fff",
          boxShadow: "8px 8px 0px #000",
          padding: 48,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "#000",
              fontFamily: "Space Grotesk",
            }}
          >
            D{district.number}
          </div>
          <Badge
            label={district.region}
            bg={REGION_COLOURS[district.region] ?? "#E5E5E5"}
          />
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#000",
            fontFamily: "Space Grotesk",
            marginTop: 12,
          }}
        >
          {district.name}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            marginTop: 32,
            fontSize: 24,
            color: "#555",
            fontFamily: "Space Grotesk",
          }}
        >
          <div style={{ display: "flex" }}>
            {district.projectCount} projects
          </div>
          <div style={{ display: "flex" }}>
            Avg ${Math.round(district.avgPsf).toLocaleString()} psf
          </div>
        </div>
      </div>

      <BrandingBar />
    </div>,
    { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "project";
  const slug = searchParams.get("slug");

  const fontConfig = await loadFont();

  if (type === "developer" && slug) {
    return renderDeveloper(slug, fontConfig);
  }

  if (type === "district" && slug) {
    return renderDistrict(slug, fontConfig);
  }

  if (slug) {
    return renderProject(slug, fontConfig);
  }

  return new ImageResponse(
    <BrandedFallback subtitle="Singapore New Condo Launch Research" />,
    { width: 1200, height: 630, headers: CACHE_HEADERS, ...fontConfig },
  );
}
