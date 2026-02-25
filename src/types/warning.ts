export interface WeatherWarning {
  heading_en: string;
  heading_bm?: string;
  text_en?: string;
  text_bm?: string;
  valid_from?: string;
  valid_to?: string;
  warning_issue?: {
    issued?: string;
    title_en?: string;
    title_bm?: string;
  };
}

export type WarningsResponse = WeatherWarning[];
