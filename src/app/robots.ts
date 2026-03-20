import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/settings", "/login", "/signup"],
      },
    ],
    sitemap: "https://whathome.sg/sitemap.xml",
  };
}
