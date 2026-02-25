import type {
  MetLocation,
  MetLocationsResponse,
  MetDataResponse,
  NowcastSlot,
  RainsNowcast,
} from '@/types/metMalaysia';

const BASE_URL = '/api/met';

const DATATYPE_OFFSET: Record<string, number> = {
  RAINS: 0,
  RAINS10m: 10,
  RAINS20m: 20,
  RAINS30m: 30,
  RAINS40m: 40,
  RAINS50m: 50,
  RAINS60m: 60,
  RAINS70m: 70,
  RAINS80m: 80,
  RAINS90m: 90,
  RAINS100m: 100,
  RAINS110m: 110,
  RAINS120m: 120,
};

export async function fetchMetStateLocations(): Promise<MetLocation[]> {
  const params = new URLSearchParams({ locationcategoryid: 'STATE' });
  const res = await fetch(`${BASE_URL}/locations?${params}`);
  if (!res.ok) throw new Error(`MET locations error: ${res.status}`);
  const json = (await res.json()) as MetLocationsResponse;
  return json.results ?? [];
}

export async function fetchRainsNowcast(locationId: string): Promise<RainsNowcast | null> {
  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({
    datasetid: 'OBSERVATION',
    datacategoryid: 'RAINS',
    locationid: locationId,
    start_date: today,
    end_date: today,
  });

  const res = await fetch(`${BASE_URL}/data?${params}`);
  if (!res.ok) throw new Error(`MET nowcast error: ${res.status}`);
  const json = (await res.json()) as MetDataResponse;

  const byOffset: Record<number, number | null> = {};
  for (const result of json.results ?? []) {
    const offset = DATATYPE_OFFSET[result.datatype];
    if (offset !== undefined) {
      byOffset[offset] = typeof result.value === 'number' ? result.value : null;
    }
  }

  const slots: NowcastSlot[] = Object.entries(DATATYPE_OFFSET)
    .map(([, offset]) => ({
      offsetMinutes: offset,
      value: byOffset[offset] ?? null,
      label: offset === 0 ? 'Sekarang' : `+${offset}min`,
    }))
    .sort((a, b) => a.offsetMinutes - b.offsetMinutes);

  const locationName = json.results?.[0]?.locationname ?? '';
  return { locationId, locationName, slots };
}
