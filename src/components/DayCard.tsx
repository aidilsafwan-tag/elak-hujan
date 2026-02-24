import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';
import { RainBar } from './RainBar';
import { useConfig } from '@/hooks/useConfig';
import { copy } from '@/constants/copy';
import { toLocalDateStr } from '@/lib/rainScoring';
import { cn } from '@/lib/utils';
import type { ScoredDay } from '@/lib/rainScoring';

const BM_DAY_NAMES: Record<string, string> = {
  monday: 'Isnin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Khamis',
  friday: 'Jumaat',
};

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
}

interface DayCardProps {
  day: ScoredDay;
  rainThreshold: number;
}

export function DayCard({ day, rainThreshold }: DayCardProps) {
  const { config, updateConfig } = useConfig();
  const navigate = useNavigate();

  const isConfirmed = config?.confirmedOfficeDays[day.dateStr] ?? false;
  const isToday = day.dateStr === toLocalDateStr(new Date());

  function handleTap() {
    if (!config) return;
    updateConfig({
      confirmedOfficeDays: {
        ...config.confirmedOfficeDays,
        [day.dateStr]: !isConfirmed,
      },
    });
  }

  function handleChevron(e: React.MouseEvent) {
    e.stopPropagation();
    navigate(`/day/${day.dateStr}`);
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4 cursor-pointer select-none transition-all duration-200 active:scale-[0.98]',
        isConfirmed
          ? 'bg-primary/8 border-primary/40 border-l-4 border-l-primary shadow-sm'
          : 'bg-card border-border hover:bg-accent/50 hover:shadow-sm',
      )}
      onClick={handleTap}
    >
      <div className="flex items-start gap-3">
        {/* Left: all day info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Day name + badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold">{BM_DAY_NAMES[day.dayName]}</span>
            <span className="text-sm text-muted-foreground">{formatShortDate(day.date)}</span>
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
            {isConfirmed && (
              <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">
                ✓ {copy.weekly.officeDay}
              </span>
            )}
          </div>

          {/* Morning */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{copy.weekly.morning}</span>
              <span className="font-medium tabular-nums">{Math.round(day.morningScore)}%</span>
            </div>
            <RainBar probability={day.morningScore} threshold={rainThreshold} />
          </div>

          {/* Evening */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{copy.weekly.evening}</span>
              <span className="font-medium tabular-nums">{Math.round(day.eveningScore)}%</span>
            </div>
            <RainBar probability={day.eveningScore} threshold={rainThreshold} />
          </div>
        </div>

        {/* Right: risk badge + chevron */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
          <RiskBadge probability={day.combinedScore} threshold={rainThreshold} />
          <button
            type="button"
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleChevron}
            aria-label="Lihat butiran hari"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
