export interface HourlyForecast {
  time: string[];
  precipitation_probability: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: HourlyForecast;
}
