import {
  createLoader,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const filterParsers = {
  q: parseAsString,
  regions: parseAsArrayOf(parseAsString).withDefault([]),
  district: parseAsInteger,
  tenures: parseAsArrayOf(parseAsString).withDefault([]),
};

export const loadSearchParams = createLoader(filterParsers);
