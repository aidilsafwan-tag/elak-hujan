import { create } from 'zustand';
import { getConfig, setConfig as saveToStorage } from '@/lib/localStorage';
import type { UserConfig } from '@/types/config';

interface ConfigStore {
  config: UserConfig | null;
  setConfig: (config: UserConfig) => void;
  updateConfig: (partial: Partial<UserConfig>) => void;
}

export const useConfig = create<ConfigStore>((set) => ({
  config: getConfig(),

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
