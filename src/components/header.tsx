import Link from "next/link";
import { SearchAutocomplete } from "@/components/search-autocomplete";

const navLinks = [
  { label: "PROJECTS", href: "/projects" },
  { label: "NEW LAUNCHES", href: "/new-launches" },
  { label: "DEVELOPERS", href: "/developers" },
  { label: "DISTRICTS", href: "/districts" },
  { label: "ANALYTICS", href: "/analytics" },
];

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b-2 border-foreground px-6 md:px-12">
      <Link href="/" className="flex items-center gap-3">
        <div className="size-8 bg-foreground" />
        <span className="font-sans text-xl font-extrabold tracking-[2px]">
          WHATHOME
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-mono text-xs font-semibold tracking-wider text-text-secondary transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <SearchAutocomplete variant="header" />
        </div>
        <a
          href="/login"
          className="bg-foreground px-5 py-2 font-mono text-[11px] font-semibold tracking-wider text-background transition-colors hover:bg-foreground/80"
        >
          LOG IN
        </a>
      </div>
    </header>
  );
}
