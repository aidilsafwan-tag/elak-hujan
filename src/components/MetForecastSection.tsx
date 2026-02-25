import { Cloud, Moon, Sunrise, Sunset } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { copy } from '@/constants/copy';
import { cn } from '@/lib/utils';
import type { ForecastPeriod, MetDailyForecast } from '@/types/metMalaysia';

const PERIOD_ICON = {
  morning: <Sunrise className="size-3" />,
  afternoon: <Sunset className="size-3" />,
  night: <Moon className="size-3" />,
};

function conditionStyle(condition: string): string {
  const lower = condition.toLowerCase();
  if (lower.includes('ribut') || lower.includes('petir')) return 'bg-red-50 border-red-200 text-red-700';
  if (lower.includes('hujan')) return 'bg-sky-50 border-sky-200 text-sky-700';
  if (lower.includes('cerah') || lower.includes('beriawan') || lower.includes('berawan')) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  return 'bg-muted/50 border-border text-muted-foreground';
}

function ForecastCell({ period }: { period: ForecastPeriod }) {
  return (
    <div className={cn('rounded-lg border p-2 text-center space-y-1', conditionStyle(period.condition))}>
      <p className="text-[10px] font-medium opacity-70 flex items-center justify-center gap-0.5">
        {PERIOD_ICON[period.period]}
        {period.label}
      </p>
      <p className="text-[10px] leading-tight line-clamp-2">{period.condition}</p>
    </div>
  );
}

export function MetForecastSection({
  forecast,
  isLoading,
  isError,
}: {
  forecast: MetDailyForecast | null;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[72px] w-full rounded-xl" />;
  if (isError) return (
    <p className="text-xs text-muted-foreground/60 text-center py-1">
      Ramalan MET tidak tersedia
    </p>
  );
  if (!forecast) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Cloud className="size-3.5" />
          {copy.leaveAdvisor.metForecastTitle}
        </p>
        <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          MET Malaysia
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {forecast.periods.map((p) => (
          <ForecastCell key={p.period} period={p} />
        ))}
      </div>
    </div>
  );
}
