import { useQuery } from '@tanstack/react-query';
import { fetchActiveWarnings, WARNINGS_STALE_MS } from '@/services/dataGovMy';
import { useConfig } from './useConfig';
import type { WeatherWarning } from '@/types/warning';

/**
 * Returns true if the warning's state field (string or array) overlaps
 * with the user's configured states. Warnings with no state field are
 * treated as nationwide and always shown.
 */
function isRelevant(warning: WeatherWarning, userStates: string[]): boolean {
  if (!warning.state) return true;
  const warnStates = Array.isArray(warning.state) ? warning.state : [warning.state];
  return warnStates.some((ws) =>
    userStates.some(
      (us) =>
        ws.toLowerCase().includes(us.toLowerCase()) ||
        us.toLowerCase().includes(ws.toLowerCase()),
    ),
  );
}

export function useWarnings(): { warnings: WeatherWarning[]; isLoading: boolean } {
  const { config } = useConfig();

  const userStates = config
    ? [config.homeLocation.state, config.officeLocation.state].filter(Boolean)
    : [];

  const query = useQuery({
    queryKey: ['warnings'],
    queryFn: fetchActiveWarnings,
    staleTime: WARNINGS_STALE_MS,
    enabled: !!config,
  });

  const warnings = (query.data ?? []).filter((w) => isRelevant(w, userStates));

  return { warnings, isLoading: query.isLoading };
}
