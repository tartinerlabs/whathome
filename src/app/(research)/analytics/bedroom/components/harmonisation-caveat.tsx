/**
 * Warning notice for GFA harmonisation data from June 2023 onwards.
 * Areas post-harmonisation are 5-17% smaller than pre-harmonisation for
 * equivalent physical units — affects bedroom type inference accuracy.
 */
export function HarmonisationCaveat() {
  return (
    <div className="border-2 border-foreground p-4 text-sm" role="note">
      <p className="text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Transactions from
        projects with a launch date on or after 1 June 2023 may show smaller
        recorded areas due to{" "}
        <strong className="text-foreground">
          URA GFA harmonisation (DC22-09)
        </strong>
        . Bedroom type inference for these transactions is adjusted upward by
        approximately 10% to account for the measurement change. Data with
        N&lt;5 is excluded due to insufficient sample size.
      </p>
    </div>
  );
}
