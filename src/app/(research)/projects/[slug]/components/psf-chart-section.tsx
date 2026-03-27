"use client";

import { PsfChart } from "@/components/psf-chart";
import type { BedroomPsfDataPoint } from "@/lib/queries/transactions";
import type { PsfDataPoint } from "@/lib/types";
import { BedroomPsfChart } from "./bedroom-psf-chart";

interface PsfChartSectionProps {
  data: PsfDataPoint[];
  bedroomData?: BedroomPsfDataPoint[];
}

export function PsfChartSection({ data, bedroomData }: PsfChartSectionProps) {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          PSF Trend (12 Months)
        </h2>
        {bedroomData && bedroomData.length > 0 ? (
          <BedroomPsfChart data={bedroomData} />
        ) : (
          <PsfChart data={data} height={300} />
        )}
      </div>
    </section>
  );
}
