interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    href: string;
  };
  meta?: string;
}

export function SectionHeader({ title, action, meta }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="font-sans text-2xl font-bold tracking-tight">{title}</h2>
        {meta && (
          <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          className="font-mono text-xs font-semibold tracking-wider text-text-secondary transition-colors hover:text-foreground"
        >
          {action.label} &rarr;
        </a>
      )}
    </div>
  );
}
