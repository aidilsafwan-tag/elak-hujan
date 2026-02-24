import { cn } from '@/lib/utils';

interface RainBarProps {
  probability: number; // 0–100
  threshold?: number;
  className?: string;
}

export function RainBar({ probability, threshold = 40, className }: RainBarProps) {
  const isSevere = probability >= 70;
  const isRisky = probability >= threshold;

  return (
    <div className={cn('h-3 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          isSevere ? 'bg-red-500' : isRisky ? 'bg-amber-400' : 'bg-emerald-500',
        )}
        style={{ width: `${Math.min(probability, 100)}%` }}
      />
    </div>
  );
}
