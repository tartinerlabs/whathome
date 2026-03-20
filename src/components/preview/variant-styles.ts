import type { ThemeVariant } from "./types";

interface VariantStyleMap {
  card: string;
  cardHeader: string;
  heading: string;
  badge: string;
  table: string;
  tableHead: string;
  tableRow: string;
  button: string;
  input: string;
  chip: string;
  chartContainer: string;
  label: string;
  shadow: string;
}

export const variantStyles: Record<ThemeVariant, VariantStyleMap> = {
  full: {
    card: "border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--foreground)]",
    cardHeader: "border-b-2 border-foreground",
    heading: "uppercase font-bold tracking-wide",
    badge:
      "rounded-none border-2 border-foreground font-bold uppercase text-[10px] tracking-wider",
    table: "border-2 border-foreground",
    tableHead:
      "border-b-2 border-foreground uppercase font-bold tracking-wide text-[10px]",
    tableRow: "border-b-2 border-foreground",
    button:
      "border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wide",
    input: "border-2 border-foreground rounded-none",
    chip: "border-2 border-foreground rounded-none font-bold uppercase text-[10px] tracking-wider px-2 py-0.5",
    chartContainer: "border-2 border-foreground rounded-none p-4",
    label: "uppercase font-bold tracking-wide text-[10px]",
    shadow: "shadow-[4px_4px_0px_0px_var(--foreground)]",
  },
  soft: {
    card: "border border-border rounded-lg shadow-sm",
    cardHeader: "border-b border-border",
    heading: "font-semibold",
    badge: "rounded-md font-medium text-[11px]",
    table: "border border-border rounded-lg overflow-hidden",
    tableHead:
      "border-b border-border font-medium text-[11px] text-muted-foreground",
    tableRow: "border-b border-border last:border-0",
    button:
      "border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow font-medium",
    input: "border border-border rounded-lg",
    chip: "border border-border rounded-full font-medium text-[11px] px-2.5 py-0.5",
    chartContainer: "border border-border rounded-lg p-4 shadow-sm",
    label: "font-medium text-[11px] text-muted-foreground",
    shadow: "shadow-sm",
  },
};
