import type { MetadataRoute } from "next";
import { getAllDeveloperSlugs } from "@/lib/queries/developers";
import { getAllDistricts } from "@/lib/queries/districts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://whathome.vercel.app";

  const [developers, districts] = await Promise.all([
    getAllDeveloperSlugs(),
    getAllDistricts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
    },
    {
      url: `${baseUrl}/projects`,
    },
    {
      url: `${baseUrl}/new-launches`,
    },
    {
      url: `${baseUrl}/developers`,
    },
    {
      url: `${baseUrl}/districts`,
    },
    {
      url: `${baseUrl}/compare`,
    },
    {
      url: `${baseUrl}/analytics`,
    },
    {
      url: `${baseUrl}/about`,
    },
  ];

  const developerPages: MetadataRoute.Sitemap = developers.map((developer) => ({
    url: `${baseUrl}/developers/${developer.slug}`,
  }));

  const districtPages: MetadataRoute.Sitemap = districts.map((district) => ({
    url: `${baseUrl}/districts/${district.number}`,
  }));

  return [...staticPages, ...developerPages, ...districtPages];
}
