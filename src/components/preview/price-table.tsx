import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ThemeVariant, UnitMixRow } from "./types";
import { variantStyles } from "./variant-styles";

interface PriceTableProps {
  units: UnitMixRow[];
  variant: ThemeVariant;
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${(value / 1_000).toFixed(0)}K`;
}

export function PriceTable({ units, variant }: PriceTableProps) {
  const styles = variantStyles[variant];

  return (
    <div className="space-y-2">
      <h3 className={cn(styles.heading, "text-sm")}>Unit Mix & Pricing</h3>
      <div className={cn(styles.table)}>
        <Table>
          <TableHeader>
            <TableRow className={cn(styles.tableHead, "hover:bg-transparent")}>
              <TableHead className={cn(styles.label)}>Type</TableHead>
              <TableHead className={cn(styles.label, "text-right")}>
                Size (sqft)
              </TableHead>
              <TableHead className={cn(styles.label, "text-right")}>
                PSF
              </TableHead>
              <TableHead className={cn(styles.label, "text-right")}>
                Price Range
              </TableHead>
              <TableHead className={cn(styles.label, "text-right")}>
                Sold
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => {
              const soldPct = Math.round(
                (unit.soldCount / unit.totalCount) * 100,
              );
              return (
                <TableRow key={unit.unitType} className={cn(styles.tableRow)}>
                  <TableCell className="font-mono font-semibold">
                    {unit.unitType}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {unit.sizeSqftMin.toLocaleString()}–
                    {unit.sizeSqftMax.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${unit.pricePsf.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(unit.priceFrom)} – {formatPrice(unit.priceTo)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {unit.soldCount}/{unit.totalCount}
                    </span>
                    <span
                      className={cn(
                        "ml-1",
                        styles.label,
                        soldPct >= 80
                          ? "text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      ({soldPct}%)
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
