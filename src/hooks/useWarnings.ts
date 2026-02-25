import { useQuery } from '@tanstack/react-query';
import { fetchActiveWarnings, WARNINGS_STALE_MS } from '@/services/dataGovMy';
import { useConfig } from './useConfig';
import type { WeatherWarning } from '@/types/warning';

export function useWarnings(): { warnings: WeatherWarning[]; isLoading: boolean } {
  const { config } = useConfig();

  const query = useQuery({
    queryKey: ['warnings'],
    queryFn: fetchActiveWarnings,
    staleTime: WARNINGS_STALE_MS,
    enabled: !!config,
  });

  return { warnings: query.data ?? [], isLoading: query.isLoading };
}
