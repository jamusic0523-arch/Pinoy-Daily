
const PSGC_API = "https://psgc.billyjamesramos.com/api/v1";

export type PSGCLevel =
  | "region"
  | "province"
  | "city"
  | "municipality"
  | "barangay"
  | "sub-municipality";

export type PSGCResult = {
  code: string;
  name: string;
  level: PSGCLevel;
  fullName: string;
};

export type PSGCItem = {
  code: string;
  name: string;
  [key: string]: unknown;
};

type PSGCListResponse<T> = {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type PSGCResponse<T> = {
  data: T;
};

async function psgcFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${PSGC_API}${path}`);

  if (!response.ok) {
    throw new Error("Hindi ma-load ang geographic database.");
  }

  const result = await response.json();
  return result.data as T;
}

export async function getPSGCVersion() {
  return psgcFetch<{
    version: string;
    releaseName: string;
    releaseDate: string;
    counts: Record<string, number>;
  }>("/meta");
}

export async function getRegions() {
  return psgcFetch<PSGCItem[]>("/regions?limit=100");
}

export async function getProvinces(regionCode: string) {
  return psgcFetch<PSGCItem[]>(
    `/regions/${regionCode}/provinces?limit=100`
  );
}

export async function getCitiesMunicipalities(
  regionCode: string,
  provinceCode?: string
) {
  const province = provinceCode || "none";

  return psgcFetch<PSGCItem[]>(
    `/regions/${regionCode}/cities-municipalities?province=${province}`
  );
}

export async function getCitiesByProvince(provinceCode: string) {
  return psgcFetch<PSGCItem[]>(
    `/provinces/${provinceCode}/cities-municipalities?limit=500`
  );
}

export async function getBarangays(cityCode: string) {
  return psgcFetch<PSGCItem[]>(
    `/cities-municipalities/${cityCode}/barangays?limit=1000`
  );
}

export async function searchPSGCLocations(
  query: string
): Promise<PSGCResult[]> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) return [];

  const params = new URLSearchParams({
    q: cleanQuery,
    limit: "30",
  });

  return psgcFetch<PSGCResult[]>(`/search?${params.toString()}`);
}

export async function getPSGCCode(code: string) {
  return psgcFetch<Record<string, unknown>>(`/codes/${code}`);
}
