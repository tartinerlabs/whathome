/**
 * Pure computation functions for buy-sell pair returns.
 * No DB or external dependencies.
 */

export type HoldingBucket = "0-3y" | "3-5y" | "5-7y" | "7-10y" | "10y+";

export interface Returns {
  profitAmount: number;
  profitPercent: number;
  cagr: number;
}

/**
 * Compute profit amount, profit percent, and CAGR from a buy-sell pair.
 */
export function computeReturns(
  buyPrice: number,
  sellPrice: number,
  holdingMonths: number,
): Returns {
  const profitAmount = sellPrice - buyPrice;
  const profitPercent = (profitAmount / buyPrice) * 100;
  const holdingYears = holdingMonths / 12;
  const cagr =
    holdingYears > 0
      ? ((sellPrice / buyPrice) ** (1 / holdingYears) - 1) * 100
      : 0;

  return { profitAmount, profitPercent, cagr };
}

/**
 * Classify holding period into SSD-era buckets.
 */
export function holdingBucket(months: number): HoldingBucket {
  const years = months / 12;
  if (years <= 3) return "0-3y";
  if (years <= 5) return "3-5y";
  if (years <= 7) return "5-7y";
  if (years <= 10) return "7-10y";
  return "10y+";
}

/**
 * Derive decade label from a date string (YYYY-MM-DD or YYYY-MM).
 */
export function decade(dateStr: string): string {
  const year = parseInt(dateStr.slice(0, 4), 10);
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

/**
 * Compute holding months between two dates.
 */
export function holdingMonths(buyDate: string, sellDate: string): number {
  const buy = new Date(buyDate);
  const sell = new Date(sellDate);
  const diffMs = sell.getTime() - buy.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44));
}
