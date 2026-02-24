import { Label } from '@/components/ui/label';
import { copy } from '@/constants/copy';
import { cn } from '@/lib/utils';
import type { UserConfig } from '@/types/config';

interface StepDaysProps {
  draft: Partial<UserConfig>;
  onUpdate: (partial: Partial<UserConfig>) => void;
}

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const DAY_LABELS = copy.onboarding.days.days;

export function StepDays({ draft, onUpdate }: StepDaysProps) {
  const officeDaysPerWeek = draft.officeDaysPerWeek ?? 3;
  const preferredDays = draft.preferredDays ?? [...ALL_DAYS];

  function toggleDay(day: string) {
    const next = preferredDays.includes(day)
      ? preferredDays.filter((d) => d !== day)
      : [...preferredDays, day];
    onUpdate({ preferredDays: next });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-medium">
          {copy.onboarding.days.daysPerWeekLabel}
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onUpdate({ officeDaysPerWeek: n })}
              className={cn(
                'flex-1 h-12 rounded-lg border text-base font-semibold transition-colors',
                officeDaysPerWeek === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:bg-accent',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">
          {copy.onboarding.days.preferredDaysLabel}
        </Label>
        <div className="flex gap-2">
          {ALL_DAYS.map((day) => {
            const isSelected = preferredDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'flex-1 h-12 rounded-lg border text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-input hover:bg-accent',
                )}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
