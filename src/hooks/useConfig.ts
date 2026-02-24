import { create } from 'zustand';
import {
  getConfig,
  setConfig as saveToStorage,
  pruneOldConfirmedDays,
} from '@/lib/localStorage';
import type { UserConfig } from '@/types/config';

interface ConfigStore {
  config: UserConfig | null;
  setConfig: (config: UserConfig) => void;
  updateConfig: (partial: Partial<UserConfig>) => void;
}

function loadInitialConfig(): UserConfig | null {
  const stored = getConfig();
  if (!stored) return null;
  const pruned = pruneOldConfirmedDays(stored.confirmedOfficeDays);
  if (Object.keys(pruned).length !== Object.keys(stored.confirmedOfficeDays).length) {
    const updated = { ...stored, confirmedOfficeDays: pruned };
    saveToStorage(updated);
    return updated;
  }
  return stored;
}

export const useConfig = create<ConfigStore>((set) => ({
  config: loadInitialConfig(),

  setConfig: (config) => {
    saveToStorage(config);
    set({ config });
  },

  updateConfig: (partial) => {
    set((state) => {
      if (!state.config) return state;
      const updated = { ...state.config, ...partial };
      saveToStorage(updated);
      return { config: updated };
    });
  },
}));
