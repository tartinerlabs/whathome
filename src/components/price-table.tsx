import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UnitMixRow } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PriceTableProps {
  units: UnitMixRow[];
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${(value / 1_000).toFixed(0)}K`;
}

export function PriceTable({ units }: PriceTableProps) {
  return (
    <div className="border-2 border-foreground">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground uppercase font-bold tracking-wide text-[10px] hover:bg-transparent">
            <TableHead className="uppercase font-bold tracking-wide text-[10px]">
              Type
            </TableHead>
            <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
              Size (sqft)
            </TableHead>
            <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
              PSF
            </TableHead>
            <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
              Price Range
            </TableHead>
            <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
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
              <TableRow
                key={unit.unitType}
                className="border-b-2 border-foreground"
              >
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
                      "ml-1 uppercase font-bold tracking-wide text-[10px]",
                      soldPct >= 80 ? "text-success" : "text-muted-foreground",
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
  );
}
