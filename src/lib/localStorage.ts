import type { UserConfig } from '@/types/config';
import { CONFIRMED_DAYS_TTL_DAYS } from '@/constants/thresholds';

const CONFIG_KEY = 'elakhujan_config';

export function getConfig(): UserConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserConfig;
  } catch {
    return null;
  }
}

export function setConfig(config: UserConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

export function pruneOldConfirmedDays(
  confirmedOfficeDays: Record<string, boolean>,
): Record<string, boolean> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CONFIRMED_DAYS_TTL_DAYS);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return Object.fromEntries(
    Object.entries(confirmedOfficeDays).filter(([date]) => date >= cutoffStr),
  );
}
