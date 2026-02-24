export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    state?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export async function searchLocations(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'my',
    addressdetails: '1',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        'Accept-Language': 'ms,en',
        'User-Agent': 'ElakHujan/1.0 (rain planner for Malaysian riders)',
      },
    },
  );

  if (!res.ok) throw new Error('Nominatim search failed');
  return res.json() as Promise<NominatimResult[]>;
}
