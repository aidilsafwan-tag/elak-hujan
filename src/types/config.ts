export interface Location {
  name: string;
  lat: number;
  lon: number;
  state: string;
}

export interface TimeWindow {
  start: string; // "08:00"
  end: string;   // "09:00"
}

export interface UserConfig {
  homeLocation: Location;
  officeLocation: Location;
  morningWindow: TimeWindow;
  eveningWindow: TimeWindow;
  officeDaysPerWeek: number;
  preferredDays: string[]; // ["monday", "tuesday", ...]
  confirmedOfficeDays: Record<string, boolean>; // { "2026-02-23": true }
  rainThreshold: number;
  onboardingComplete: boolean;
  configVersion: number;
}
