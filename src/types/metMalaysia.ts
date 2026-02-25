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

export interface NowcastSlot {
  offsetMinutes: number;
  /** Rain value in mm. Null means data unavailable for this slot. */
  value: number | null;
  label: string;
}

export interface RainsNowcast {
  locationId: string;
  locationName: string;
  slots: NowcastSlot[];
}
