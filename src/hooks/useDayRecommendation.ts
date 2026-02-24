import { useMemo } from 'react';
import { useWeather } from './useWeather';
import { useConfig } from './useConfig';
import { scoreDays, getRecommendedDays, type ScoredDay } from '@/lib/rainScoring';

export function useDayRecommendation(): {
  days: ScoredDay[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
} {
  const { homeWeather, officeWeather, isLoading, isError, isFetching, refetch } = useWeather();
  const { config } = useConfig();

  const days = useMemo(() => {
    if (!homeWeather || !officeWeather || !config) return [];
    const scored = scoreDays(homeWeather, officeWeather, config);
    return getRecommendedDays(scored, config.officeDaysPerWeek, config.preferredDays);
  }, [homeWeather, officeWeather, config]);

  return { days, isLoading, isError, isFetching, refetch };
}
