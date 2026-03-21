import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NuqsAdapter>
  );
}
