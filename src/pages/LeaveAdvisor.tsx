import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RainBar } from '@/components/RainBar';
import { useWeather } from '@/hooks/useWeather';
import { useConfig } from '@/hooks/useConfig';
import { useNowcast } from '@/hooks/useNowcast';
import { getRecommendedLeaveTime, getRollingSlots } from '@/lib/leaveAdvisor';
import { WarningAlert } from '@/components/WarningAlert';
import { copy } from '@/constants/copy';
import { cn } from '@/lib/utils';
import type { NowcastSlot, RainsNowcast } from '@/types/metMalaysia';

function NowcastCell({ slot }: { slot: NowcastSlot }) {
  const isRaining = slot.value !== null && slot.value > 0;
  return (
    <div
      className={cn(
        'rounded-lg border p-2 text-center space-y-0.5',
        isRaining ? 'bg-sky-50 border-sky-200' : 'bg-emerald-50 border-emerald-200',
      )}
    >
      <p className="text-[10px] text-muted-foreground truncate">{slot.label}</p>
      <p
        className={cn(
          'text-xs font-semibold tabular-nums',
          isRaining ? 'text-sky-700' : 'text-emerald-700',
        )}
      >
        {slot.value !== null
          ? isRaining
            ? copy.leaveAdvisor.nowcastRaining
            : copy.leaveAdvisor.nowcastDry
          : '—'}
      </p>
    </div>
  );
}

function NowcastSection({
  nowcast,
  isLoading,
  isError,
}: {
  nowcast: RainsNowcast | null;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[72px] w-full rounded-xl" />;
  if (isError) return (
    <p className="text-xs text-muted-foreground/60 text-center py-1">
      Radar MET tidak tersedia
    </p>
  );
  if (!nowcast) return null;

  const keySlots = nowcast.slots.filter((s) =>
    [0, 30, 60, 90, 120].includes(s.offsetMinutes),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {copy.leaveAdvisor.nowcastTitle}
        </p>
        <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          MET Radar
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {keySlots.map((slot) => (
          <NowcastCell key={slot.offsetMinutes} slot={slot} />
        ))}
      </div>
    </div>
  );
}

function SlotRow({
  time,
  probability,
  rainThreshold,
  isRecommended,
}: {
  time: string;
  probability: number;
  rainThreshold: number;
  isRecommended: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-2.5',
        isRecommended ? 'bg-primary/5 border-primary/30' : 'bg-card',
      )}
    >
      <span className="text-sm font-medium w-12 tabular-nums shrink-0">{time}</span>
      <RainBar probability={probability} threshold={rainThreshold} className="flex-1" />
      <span className="text-sm tabular-nums w-9 text-right text-muted-foreground shrink-0">
        {Math.round(probability)}%
      </span>
      {isRecommended && (
        <span className="text-xs font-semibold text-primary shrink-0">←</span>
      )}
    </div>
  );
}

export function LeaveAdvisor() {
  const { config } = useConfig();
  const { officeWeather, isLoading, isError, refetch } = useWeather();
  const { nowcast, isLoading: isNowcastLoading, isError: isNowcastError } = useNowcast(config?.officeLocation);

  if (!config) return null;

  const today = new Date();
  const currentHour = today.getHours();

  const rec = officeWeather
    ? getRecommendedLeaveTime(officeWeather, today, config.eveningWindow, config.rainThreshold)
    : null;

  const rollingSlots = officeWeather
    ? getRollingSlots(officeWeather, today, currentHour, 4)
    : [];

  return (
    <div className="px-4 py-6 space-y-5">
      {/* MET Malaysia warning banner */}
      <WarningAlert />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{copy.leaveAdvisor.title}</h1>
        <Button size="icon-sm" variant="ghost" onClick={refetch} aria-label={copy.leaveAdvisor.refresh}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-destructive">{copy.errors.weatherFetch}</p>
          <Button size="sm" variant="outline" onClick={refetch}>Cuba lagi</Button>
        </div>
      )}

      {/* No office weather */}
      {!isLoading && !isError && !officeWeather && (
        <p className="text-sm text-muted-foreground">{copy.leaveAdvisor.noOfficeWeather}</p>
      )}

      {/* MET radar nowcast — loads independently of Open-Meteo */}
      <NowcastSection nowcast={nowcast} isLoading={isNowcastLoading} isError={isNowcastError} />

      {!isLoading && !isError && rec && (
        <>
          {/* Recommendation card */}
          <div
            className={cn(
              'rounded-2xl p-5 space-y-3',
              rec.hasCleanWindow
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-500/25'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25',
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              {copy.leaveAdvisor.recommendedSlot}
            </p>
            <p className="text-5xl font-bold tabular-nums tracking-tight text-white">
              {rec.recommendedTime}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-xs font-semibold text-white">
                {Math.round(rec.probability)}% hujan
              </span>
              {!rec.hasCleanWindow && (
                <span className="text-xs text-white/90 font-medium">
                  ⚠️ {copy.leaveAdvisor.noDryWindow}
                </span>
              )}
            </div>
          </div>

          {/* Scan window slots */}
          {rec.slots.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {copy.leaveAdvisor.scanWindowTitle}
              </p>
              <div className="space-y-1.5">
                {rec.slots.map((slot) => (
                  <SlotRow
                    key={slot.hour}
                    time={slot.time}
                    probability={slot.probability}
                    rainThreshold={config.rainThreshold}
                    isRecommended={slot.time === rec.recommendedTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rolling slots from now (only when outside scan window) */}
          {rollingSlots.length > 0 &&
            !rec.slots.some((s) => s.hour === currentHour) && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {copy.leaveAdvisor.rollingTitle}
              </p>
              <div className="space-y-1.5">
                {rollingSlots.map((slot) => (
                  <SlotRow
                    key={slot.hour}
                    time={slot.time}
                    probability={slot.probability}
                    rainThreshold={config.rainThreshold}
                    isRecommended={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
