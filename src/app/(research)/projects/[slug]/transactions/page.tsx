import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProjectBySlug } from "@/lib/queries/projects";
import { getTransactionsByProject } from "@/lib/queries/transactions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return { title: "Transactions Not Found" };

  return {
    title: `${data.project.name} Transactions`,
    description: `View all transaction records for ${data.project.name}. Historical sale prices, PSF trends, and unit-level data.`,
  };
}

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) notFound();

  const { project } = data;
  const transactions = await getTransactionsByProject(project.id);

  const avgPsf =
    transactions.length > 0
      ? Math.round(
          transactions.reduce((sum, t) => sum + t.pricePsf, 0) /
            transactions.length,
        )
      : 0;

  const priceRange =
    transactions.length > 0
      ? {
          min: Math.min(...transactions.map((t) => t.transactedPrice)),
          max: Math.max(...transactions.map((t) => t.transactedPrice)),
        }
      : null;

  return (
    <>
      <section className="border-b-2 border-foreground px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <a
              href={`/projects/${slug}`}
              className="font-mono text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to {project.name}
            </a>
          </div>

          <SectionHeader
            title={`${project.name} Transactions`}
            meta={`${transactions.length} RECORDS`}
          />

          {transactions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-foreground p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Transactions
                </p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {transactions.length}
                </p>
              </div>
              <div className="border-2 border-foreground p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Average PSF
                </p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  ${avgPsf.toLocaleString()}
                </p>
              </div>
              <div className="border-2 border-foreground p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Price Range
                </p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {priceRange
                    ? `$${(priceRange.min / 1_000_000).toFixed(1)}M–$${(priceRange.max / 1_000_000).toFixed(1)}M`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          {transactions.length === 0 ? (
            <div className="border-2 border-foreground p-12 text-center">
              <p className="text-muted-foreground">
                No transaction records available for this project yet.
              </p>
            </div>
          ) : (
            <div className="border-2 border-foreground overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-foreground hover:bg-transparent">
                    <TableHead className="uppercase font-bold tracking-wide text-[10px]">
                      Date
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px]">
                      Unit
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px]">
                      Floor
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
                      Area (sqft)
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
                      Price
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px] text-right">
                      PSF
                    </TableHead>
                    <TableHead className="uppercase font-bold tracking-wide text-[10px]">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow
                      key={txn.id}
                      className="border-b-2 border-foreground"
                    >
                      <TableCell className="font-mono text-sm">
                        {txn.contractDate}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {txn.unitNumber}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {txn.floorRange}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right">
                        {txn.areaSqft.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right">
                        ${txn.transactedPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-right">
                        ${txn.pricePsf.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] font-bold uppercase tracking-wider">
                        {txn.saleType.replace("_", " ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
