import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { useWeather } from '@/hooks/useWeather';
import { useConfig } from '@/hooks/useConfig';
import { getRecommendedLeaveTime } from '@/lib/leaveAdvisor';
import { copy } from '@/constants/copy';

export function LeavePanel() {
  const { config } = useConfig();
  const { officeWeather } = useWeather();

  if (!config || !officeWeather) return null;

  const rec = getRecommendedLeaveTime(
    officeWeather,
    new Date(),
    config.eveningWindow,
    config.rainThreshold,
  );

  return (
    <Link
      to="/leave"
      className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent/30 transition-colors"
    >
      <Clock className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{copy.leaveAdvisor.panelLabel}</p>
        <p className="text-sm font-semibold">
          {rec.recommendedTime}
          {!rec.hasCleanWindow && ' ⚠️'}
        </p>
      </div>
      <RiskBadge probability={rec.probability} threshold={config.rainThreshold} />
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
