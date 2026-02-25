import type {
  MetLocation,
  MetLocationsResponse,
  MetDataResponse,
  ForecastPeriod,
  MetDailyForecast,
} from '@/types/metMalaysia';

const BASE_URL = '/api/met';

const PERIOD_MAP: Record<string, ForecastPeriod['period']> = {
  FGM: 'morning',
  FGA: 'afternoon',
  FGN: 'night',
};

const PERIOD_LABEL: Record<ForecastPeriod['period'], string> = {
  morning: 'Pagi',
  afternoon: 'Petang',
  night: 'Malam',
};

export async function fetchMetStateLocations(): Promise<MetLocation[]> {
  const params = new URLSearchParams({ locationcategoryid: 'STATE' });
  const res = await fetch(`${BASE_URL}/locations?${params}`);
  if (!res.ok) throw new Error(`MET locations error: ${res.status}`);
  const json = (await res.json()) as MetLocationsResponse;
  return json.results ?? [];
}

export async function fetchTodayForecast(locationId: string): Promise<MetDailyForecast | null> {
  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({
    datasetid: 'FORECAST',
    datacategoryid: 'GENERAL',
    locationid: locationId,
    start_date: today,
    end_date: today,
    lang: 'ms',
  });

  const res = await fetch(`${BASE_URL}/data?${params}`);
  if (!res.ok) throw new Error(`MET forecast error: ${res.status}`);
  const json = (await res.json()) as MetDataResponse;

  const periods: ForecastPeriod[] = (json.results ?? [])
    .filter((r) => PERIOD_MAP[r.datatype])
    .map((r) => {
      const period = PERIOD_MAP[r.datatype];
      return {
        period,
        label: PERIOD_LABEL[period],
        condition: typeof r.value === 'string' ? r.value : String(r.value ?? ''),
      };
    });

  if (periods.length === 0) return null;

  const locationName = json.results?.[0]?.locationname ?? '';
  return { locationId, locationName, date: today, periods };
}
