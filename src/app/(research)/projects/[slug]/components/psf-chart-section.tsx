"use client";

import { PsfChart } from "@/components/psf-chart";
import type { PsfDataPoint } from "@/lib/types";

interface PsfChartSectionProps {
  data: PsfDataPoint[];
}

export function PsfChartSection({ data }: PsfChartSectionProps) {
  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-4">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          PSF Trend (12 Months)
        </h2>
        <PsfChart data={data} height={300} />
      </div>
    </section>
  );
}
