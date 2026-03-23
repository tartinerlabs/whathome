import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { AppSidebar } from "./dashboard/components/app-sidebar";

async function AuthenticatedSidebar() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  return <AppSidebar isAdmin={session.user.role === "admin"} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<Skeleton className="h-screen w-56" />}>
        <AuthenticatedSidebar />
      </Suspense>
      <SidebarInset>
        <div className="mx-auto w-full max-w-6xl p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
