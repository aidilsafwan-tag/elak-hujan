import { ChevronRight, Sunrise, Sunset } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RiskBadge } from "./RiskBadge";
import { RainBar } from "./RainBar";
import { copy } from "@/constants/copy";
import { toLocalDateStr } from "@/lib/rainScoring";
import type { ScoredDay } from "@/lib/rainScoring";

const BM_DAY_NAMES: Record<string, string> = {
  monday: "Isnin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Khamis",
  friday: "Jumaat",
};

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
}

interface DayCardProps {
  day: ScoredDay;
  rainThreshold: number;
}

export function DayCard({ day, rainThreshold }: DayCardProps) {
  const navigate = useNavigate();
  const isToday = day.dateStr === toLocalDateStr(new Date());

  return (
    <div
      className="rounded-xl border bg-card border-border hover:bg-accent/50 hover:shadow-sm p-4 cursor-pointer select-none transition-all duration-200 active:scale-[0.98]"
      onClick={() => navigate(`/day/${day.dateStr}`)}
    >
      <div className="flex items-start gap-3">
        {/* Left: all day info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Day name + badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">{BM_DAY_NAMES[day.dayName]}</span>
            <span className="text-sm text-muted-foreground">
              {formatShortDate(day.date)}
            </span>
            {isToday && (
              <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Hari ini
              </span>
            )}
            {day.isRecommended && (
              <span className="rounded-full bg-sky-100 border border-sky-200 text-sky-700 px-2 py-0.5 text-xs font-medium">
                {copy.weekly.recommended}
              </span>
            )}
          </div>

          {/* Morning */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Sunrise className="size-3 text-amber-500" />
                {copy.weekly.morning}
              </span>
              <span className="font-medium tabular-nums">
                {Math.round(day.morningScore)}%
              </span>
            </div>
            <RainBar probability={day.morningScore} threshold={rainThreshold} />
          </div>

          {/* Evening */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Sunset className="size-3 text-indigo-400" />
                {copy.weekly.evening}
              </span>
              <span className="font-medium tabular-nums">
                {Math.round(day.eveningScore)}%
              </span>
            </div>
            <RainBar probability={day.eveningScore} threshold={rainThreshold} />
          </div>
        </div>

        {/* Right: risk badge + chevron */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
          <RiskBadge
            probability={day.combinedScore}
            threshold={rainThreshold}
          />
          <span className="p-1 text-muted-foreground">
            <ChevronRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
