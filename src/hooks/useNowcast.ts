import { useQuery } from '@tanstack/react-query';
import { fetchMetStateLocations, fetchRainsNowcast } from '@/services/metMalaysia';
import { NOWCAST_CACHE_MINUTES, MET_LOCATIONS_CACHE_HOURS } from '@/constants/thresholds';
import type { Location } from '@/types/config';
import type { MetLocation, RainsNowcast } from '@/types/metMalaysia';

function resolveStateLocationId(
  stateName: string,
  locations: MetLocation[],
): string | null {
  const lower = stateName.toLowerCase();
  const match = locations.find(
    (loc) =>
      loc.locationname.toLowerCase().includes(lower) ||
      lower.includes(loc.locationname.toLowerCase()),
  );
  return match?.id ?? null;
}

export function useNowcast(officeLocation: Location | undefined): {
  nowcast: RainsNowcast | null;
  isLoading: boolean;
} {
  const enabled = !!officeLocation;

  const { data: stateLocations = [] } = useQuery({
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

  const { data: nowcast = null, isLoading } = useQuery({
    queryKey: ['met-nowcast', locationId],
    queryFn: () => fetchRainsNowcast(locationId!),
    staleTime: NOWCAST_CACHE_MINUTES * 60 * 1000,
    refetchInterval: NOWCAST_CACHE_MINUTES * 60 * 1000,
    retry: false,
    enabled: enabled && !!locationId,
  });

  return { nowcast, isLoading: enabled && isLoading };
}
