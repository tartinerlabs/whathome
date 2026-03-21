export function Footer() {
  return (
    <footer className="border-t-2 border-foreground px-6 py-12 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-sans text-lg font-extrabold tracking-[2px]">
              WHATHOME
            </span>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Singapore new condo launch research
            </p>
          </div>
        </div>

        <div className="my-6 h-px bg-border" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            &copy; 2026 Tartiner Labs
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Made in Singapore
          </p>
        </div>
      </div>
    </footer>
  );
}
