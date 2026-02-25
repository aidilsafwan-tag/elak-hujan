export interface MetLocation {
  id?: string;
  locationid?: string;
  name?: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MetLocationsResponse {
  metadata: { resultset: { count: number; offset: number; limit: number } };
  results: MetLocation[];
}

export interface MetDataResult {
  locationid: string;
  locationname: string;
  date: string;
  datatype: string;
  value: number | string | null;
  latitude: number | null;
  longitude: number | null;
  attributes: Record<string, unknown>;
}

export interface MetDataResponse {
  metadata: { resultset: { count: number; offset: number; limit: number } };
  results: MetDataResult[];
}

export interface ForecastPeriod {
  period: 'morning' | 'afternoon' | 'night';
  label: string;
  condition: string;
}

export interface MetDailyForecast {
  locationId: string;
  locationName: string;
  date: string;
  periods: ForecastPeriod[];
}
