import type { WeatherWarning } from '@/types/warning';
import { WARNINGS_CACHE_MINUTES } from '@/constants/thresholds';

export const WARNINGS_STALE_MS = WARNINGS_CACHE_MINUTES * 60 * 1000;

/** Format a Date as "YYYY-MM-DDTHH:mm:ss" in local time, matching the API's timezone-naive format. */
function localISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export async function fetchActiveWarnings(): Promise<WeatherWarning[]> {
  const params = new URLSearchParams({
    limit: '20',
    sort: '-warning_issue__issued',
    valid_to__gte: localISOString(new Date()),
  });

  const res = await fetch(`https://api.data.gov.my/weather/warning?${params}`);
  if (!res.ok) throw new Error(`data.gov.my error: ${res.status}`);
  return (await res.json()) as WeatherWarning[];
}
