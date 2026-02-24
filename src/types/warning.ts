export interface WeatherWarning {
  title_en: string;
  title_ms?: string;
  text_en?: string;
  text_ms?: string;
  // State may be a string, array, or absent (= nationwide)
  state?: string | string[];
  warning_issue?: {
    issued?: string;
    valid_from?: string;
    valid_to?: string;
  };
}

export interface WarningsResponse {
  data: WeatherWarning[];
}
