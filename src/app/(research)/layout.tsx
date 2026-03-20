import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </NuqsAdapter>
  );
}
