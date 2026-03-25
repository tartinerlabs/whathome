import { toNumber } from "@/lib/format";
import {
  getMedianRentalByProject,
  getRentalsByProject,
} from "@/lib/queries/rentals";

interface RentalComparisonProps {
  projectId: string;
  projectName: string;
}

export async function RentalComparison({
  projectId,
  projectName,
}: RentalComparisonProps) {
  const [contracts, median] = await Promise.all([
    getRentalsByProject(projectId),
    getMedianRentalByProject(projectName),
  ]);

  if (!contracts.length && !median) return null;

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          Rental Data
        </h2>

        {median && (
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                Median Rent (PSF)
              </p>
              <p className="text-2xl font-bold">
                ${toNumber(median.median)?.toFixed(2) ?? "—"}
              </p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                25th Percentile
              </p>
              <p className="text-2xl font-bold">
                ${toNumber(median.psf25)?.toFixed(2) ?? "—"}
              </p>
            </div>
            <div className="border-2 border-foreground p-4">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                75th Percentile
              </p>
              <p className="text-2xl font-bold">
                ${toNumber(median.psf75)?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>
        )}

        {contracts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-foreground text-sm">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted">
                  <th className="p-3 text-left font-bold uppercase tracking-wide">
                    Bedrooms
                  </th>
                  <th className="p-3 text-right font-bold uppercase tracking-wide">
                    Rent ($/mth)
                  </th>
                  <th className="p-3 text-right font-bold uppercase tracking-wide">
                    Area (sqft)
                  </th>
                  <th className="p-3 text-right font-bold uppercase tracking-wide">
                    Lease Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={`${contract.leaseDate}-${contract.noOfBedRoom}-${contract.rent}-${contract.areaSqft}`}
                    className="border-b border-foreground/20"
                  >
                    <td className="p-3">{contract.noOfBedRoom ?? "—"}</td>
                    <td className="p-3 text-right font-mono">
                      {contract.rent?.toLocaleString() ?? "—"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {toNumber(contract.areaSqft)?.toLocaleString() ?? "—"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {contract.leaseDate ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
