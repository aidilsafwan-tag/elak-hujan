import { RISK_LEVELS } from '@/constants/thresholds';
import { cn } from '@/lib/utils';

function getRiskLevel(probability: number, threshold: number) {
  if (probability < threshold) return RISK_LEVELS.LOW;
  if (probability < 70) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.HIGH;
}

interface RiskBadgeProps {
  probability: number;
  threshold?: number;
  className?: string;
}

export function RiskBadge({ probability, threshold = 40, className }: RiskBadgeProps) {
  const level = getRiskLevel(probability, threshold);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        level.color,
        className,
      )}
    >
      {level.label}
    </span>
  );
}
