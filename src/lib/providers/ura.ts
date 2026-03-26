/**
 * URA Data Service API client.
 *
 * Base URL: https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1
 * Auth: AccessKey header (from env) + Token header (generated daily via /insertNewToken/v1).
 *
 * @see https://eservice.ura.gov.sg/uraDataService
 */

const BASE_URL = "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1";
const TOKEN_URL =
  "https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1";

// Module-level token cache (resets on cold start — fine for serverless)
let cachedToken: { value: string; expiresAt: number } | null = null;

function getAccessKey(): string {
  const key = process.env.URA_ACCESS_KEY;
  if (!key) throw new Error("URA_ACCESS_KEY environment variable is not set");
  return key;
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const response = await fetch(TOKEN_URL, {
    method: "GET",
    headers: { AccessKey: getAccessKey() },
  });

  if (!response.ok) {
    throw new Error(
      `URA token request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { Result: string };
  const token = data.Result;

  // Token valid for 24 hours — cache with 1 hour buffer
  cachedToken = {
    value: token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return token;
}

async function uraFetch<T>(params: URLSearchParams, retries = 2): Promise<T[]> {
  const token = await getToken();
  const url = `${BASE_URL}?${params.toString()}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, {
      headers: {
        AccessKey: getAccessKey(),
        Token: token,
      },
    });

    if (response.status === 429 && attempt < retries) {
      const backoff = 2 ** (attempt + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `URA API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as { Result: T[] };
    return data.Result ?? [];
  }

  throw new Error("URA API: max retries exceeded");
}

// --- URA response types (matching their JSON) ---

export interface UraTransaction {
  project: string;
  street: string;
  marketSegment: string;
  x: string;
  y: string;
  propertyType: string;
  district: string;
  tenure: string;
  typeOfSale: string;
  typeOfArea: string;
  noOfUnits: string;
  price: string;
  nettPrice: string;
  area: string;
  floorRange: string;
  contractDate: string;
}

export interface UraDeveloperSale {
  project: string;
  street: string;
  developer: string;
  marketSegment: string;
  district: string;
  x: string;
  y: string;
  refPeriod: string;
  medianPrice: string;
  lowestPrice: string;
  highestPrice: string;
  unitsAvail: string;
  launchedToDate: string;
  soldToDate: string;
  launchedInMonth: string;
  soldInMonth: string;
}

export interface UraPipelineProject {
  project: string;
  street: string;
  district: string;
  developerName: string;
  totalUnits: string;
  noOfCondo: string;
  noOfApartment: string;
  noOfDetachedHouse: string;
  noOfSemiDetached: string;
  noOfTerrace: string;
  expectedTOPYear: string;
}

export interface UraRentalContract {
  project: string;
  street: string;
  propertyType: string;
  district: string;
  noOfBedRoom: string;
  rent: string;
  areaSqft: string;
  areaSqm: string;
  leaseDate: string;
}

export interface UraMedianRental {
  project: string;
  street: string;
  district: string;
  refPeriod: string;
  median: string;
  psf25: string;
  psf75: string;
}

// --- Raw API response types (nested per-project wrappers) ---

interface RawTransactionResult {
  project: string;
  street: string;
  x: string;
  y: string;
  marketSegment: string;
  transaction: Array<
    Omit<UraTransaction, "project" | "street" | "x" | "y" | "marketSegment">
  >;
}

interface RawDevSalesResult {
  project: string;
  street: string;
  district: string;
  developer: string;
  marketSegment: string;
  developerSales: Array<
    Omit<
      UraDeveloperSale,
      "project" | "street" | "district" | "developer" | "marketSegment"
    >
  >;
}

interface RawRentalContractResult {
  project: string;
  street: string;
  rental: Array<Omit<UraRentalContract, "project" | "street">>;
}

interface RawMedianRentalResult {
  project: string;
  street: string;
  rentalMedian: Array<Omit<UraMedianRental, "project" | "street">>;
}

// --- Public API ---

export type TransactionBatch = 1 | 2 | 3 | 4;

export async function fetchToken(): Promise<string> {
  return getToken();
}

export async function getTransactions(
  batch: TransactionBatch,
): Promise<UraTransaction[]> {
  const params = new URLSearchParams({
    service: "PMI_Resi_Transaction",
    batch: String(batch),
  });
  const results = await uraFetch<RawTransactionResult>(params);
  return results.flatMap((r) =>
    (r.transaction ?? []).map((txn) => ({
      ...txn,
      project: r.project,
      street: r.street,
      x: r.x,
      y: r.y,
      marketSegment: r.marketSegment,
    })),
  );
}

export async function getDeveloperSales(
  refPeriod: string,
): Promise<UraDeveloperSale[]> {
  const params = new URLSearchParams({
    service: "PMI_Resi_Developer_Sales",
    refPeriod,
  });
  const results = await uraFetch<RawDevSalesResult>(params);
  return results.flatMap((r) =>
    (r.developerSales ?? []).map((sale) => ({
      ...sale,
      project: r.project,
      street: r.street,
      district: r.district,
      developer: r.developer,
      marketSegment: r.marketSegment,
      x: "",
      y: "",
    })),
  );
}

export async function getPipeline(): Promise<UraPipelineProject[]> {
  const params = new URLSearchParams({
    service: "PMI_Resi_Pipeline",
  });
  return uraFetch<UraPipelineProject>(params);
}

export async function getRentalContracts(
  refPeriod: string,
): Promise<UraRentalContract[]> {
  const params = new URLSearchParams({
    service: "PMI_Resi_Rental",
    refPeriod,
  });
  const results = await uraFetch<RawRentalContractResult>(params);
  return results.flatMap((r) =>
    (r.rental ?? []).map((contract) => ({
      ...contract,
      project: r.project,
      street: r.street,
    })),
  );
}

export async function getMedianRentals(): Promise<UraMedianRental[]> {
  const params = new URLSearchParams({
    service: "PMI_Resi_Rental_Median",
  });
  const results = await uraFetch<RawMedianRentalResult>(params);
  return results.flatMap((r) =>
    (r.rentalMedian ?? []).map((rental) => ({
      ...rental,
      project: r.project,
      street: r.street,
    })),
  );
}
