import type { UserConfig } from '@/types/config';

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
