import type { WeatherWarning, WarningsResponse } from '@/types/warning';
import { WARNINGS_CACHE_MINUTES } from '@/constants/thresholds';

export const WARNINGS_STALE_MS = WARNINGS_CACHE_MINUTES * 60 * 1000;

export async function fetchActiveWarnings(): Promise<WeatherWarning[]> {
  const params = new URLSearchParams({
    limit: '10',
    sort: '-warning_issue__issued',
  });

  const res = await fetch(`https://api.data.gov.my/weather/warning?${params}`);
  if (!res.ok) throw new Error(`data.gov.my error: ${res.status}`);
  const json = (await res.json()) as WarningsResponse;
  return json.data ?? [];
}
