import { useQuery } from '@tanstack/react-query';
import { fetchMetStateLocations, fetchTodayForecast } from '@/services/metMalaysia';
import { NOWCAST_CACHE_MINUTES, MET_LOCATIONS_CACHE_HOURS } from '@/constants/thresholds';
import type { Location } from '@/types/config';
import type { MetLocation, MetDailyForecast } from '@/types/metMalaysia';

function resolveStateLocationId(
  stateName: string,
  locations: MetLocation[],
): string | null {
  const lower = stateName.toLowerCase();
  const match = locations.find((loc) => {
    const name = loc.name?.toLowerCase();
    if (!name) return false;
    return name.includes(lower) || lower.includes(name);
  });
  return match?.id ?? match?.locationid ?? null;
}

export function useNowcast(officeLocation: Location | undefined): {
  forecast: MetDailyForecast | null;
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = !!officeLocation;

  const {
    data: stateLocations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError,
  } = useQuery({
    queryKey: ['met-state-locations'],
    queryFn: fetchMetStateLocations,
    staleTime: MET_LOCATIONS_CACHE_HOURS * 60 * 60 * 1000,
    retry: false,
    enabled,
  });

  const locationId =
    officeLocation && stateLocations.length > 0
      ? resolveStateLocationId(officeLocation.state, stateLocations)
      : null;

  const {
    data: forecast = null,
    isLoading: isForecastLoading,
    isError: isForecastError,
  } = useQuery({
    queryKey: ['met-forecast', locationId],
    queryFn: () => fetchTodayForecast(locationId!),
    staleTime: NOWCAST_CACHE_MINUTES * 60 * 1000,
    retry: false,
    enabled: enabled && !!locationId,
  });

  return {
    forecast,
    isLoading: enabled && (isLocationsLoading || isForecastLoading),
    isError: enabled && (isLocationsError || isForecastError),
  };
}
