import Link from "next/link";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Workflows", href: "/admin/workflows" },
  { label: "Projects", href: "/admin/projects" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r-2 border-foreground bg-muted/30">
        <div className="flex h-14 items-center border-b-2 border-foreground px-4">
          <Link
            href="/admin"
            className="font-sans text-sm font-extrabold tracking-wider"
          >
            WHATHOME ADMIN
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href as never}
              className="rounded px-3 py-2 font-mono text-xs font-medium tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t-2 border-foreground/20 p-3">
          <Link
            href="/"
            className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </div>
  );
}
