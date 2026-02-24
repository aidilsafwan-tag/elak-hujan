import type { WeatherData } from '@/types/weather';
import type { TimeWindow } from '@/types/config';
import { toLocalDateStr } from '@/lib/rainScoring';

export interface HourlySlot {
  time: string;    // "17:00"
  hour: number;    // 17
  probability: number;
}

export interface LeaveRecommendation {
  recommendedTime: string;
  probability: number;
  hasCleanWindow: boolean;
  slots: HourlySlot[]; // all scanned slots, for display
}

/**
 * Scans hourly slots from eveningWindow.start - 1hr to eveningWindow.end + 2hr.
 * Returns the earliest slot below rainThreshold, or the least-bad slot.
 */
export function getRecommendedLeaveTime(
  officeWeather: WeatherData,
  date: Date,
  eveningWindow: TimeWindow,
  rainThreshold: number,
): LeaveRecommendation {
  const dateStr = toLocalDateStr(date);
  const windowStartH = parseInt(eveningWindow.start.slice(0, 2), 10);
  const windowEndH = parseInt(eveningWindow.end.slice(0, 2), 10);
  const scanStartH = Math.max(0, windowStartH - 1);
  const scanEndH = Math.min(23, windowEndH + 2);

  const slots: HourlySlot[] = [];
  officeWeather.hourly.time.forEach((t, i) => {
    if (t.slice(0, 10) !== dateStr) return;
    const hour = parseInt(t.slice(11, 13), 10);
    if (hour >= scanStartH && hour <= scanEndH) {
      slots.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        hour,
        probability: officeWeather.hourly.precipitation_probability[i],
      });
    }
  });

  if (slots.length === 0) {
    return { recommendedTime: eveningWindow.start, probability: 0, hasCleanWindow: false, slots };
  }

  const cleanSlot = slots.find((s) => s.probability < rainThreshold);
  if (cleanSlot) {
    return { recommendedTime: cleanSlot.time, probability: cleanSlot.probability, hasCleanWindow: true, slots };
  }

  const leastBad = slots.reduce((best, s) => (s.probability < best.probability ? s : best), slots[0]);
  return { recommendedTime: leastBad.time, probability: leastBad.probability, hasCleanWindow: false, slots };
}

/** Returns up to `count` hourly slots starting at `fromHour` for today. */
export function getRollingSlots(
  officeWeather: WeatherData,
  date: Date,
  fromHour: number,
  count = 4,
): HourlySlot[] {
  const dateStr = toLocalDateStr(date);
  const slots: HourlySlot[] = [];
  officeWeather.hourly.time.forEach((t, i) => {
    if (t.slice(0, 10) !== dateStr) return;
    const hour = parseInt(t.slice(11, 13), 10);
    if (hour >= fromHour && hour < fromHour + count) {
      slots.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        hour,
        probability: officeWeather.hourly.precipitation_probability[i],
      });
    }
  });
  return slots;
}
