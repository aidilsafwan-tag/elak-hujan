import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { copy } from '@/constants/copy';
import { useConfig } from '@/hooks/useConfig';
import type { UserConfig } from '@/types/config';
import { StepLocation } from './StepLocation';
import { StepCommute } from './StepCommute';
import { StepDays } from './StepDays';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 3;

const STEP_META = [
  { title: copy.onboarding.location.title, subtitle: copy.onboarding.location.subtitle },
  { title: copy.onboarding.commute.title, subtitle: copy.onboarding.commute.subtitle },
  { title: copy.onboarding.days.title, subtitle: copy.onboarding.days.subtitle },
];

const DEFAULT_DRAFT: Partial<UserConfig> = {
  morningWindow: { start: '08:00', end: '09:00' },
  eveningWindow: { start: '17:00', end: '18:00' },
  officeDaysPerWeek: 3,
  preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  rainThreshold: 40,
};

function isStepValid(step: number, draft: Partial<UserConfig>): boolean {
  switch (step) {
    case 1:
      return !!(
        draft.homeLocation?.name &&
        draft.homeLocation?.state &&
        draft.officeLocation?.name &&
        draft.officeLocation?.state
      );
    case 2:
      return !!(draft.morningWindow?.start && draft.eveningWindow?.start);
    case 3:
      return !!(draft.officeDaysPerWeek && (draft.preferredDays?.length ?? 0) > 0);
    default:
      return false;
  }
}

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Partial<UserConfig>>(DEFAULT_DRAFT);
  const { setConfig } = useConfig();
  const navigate = useNavigate();

  function updateDraft(partial: Partial<UserConfig>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleFinish() {
    const finalConfig: UserConfig = {
      homeLocation: draft.homeLocation!,
      officeLocation: draft.officeLocation!,
      morningWindow: draft.morningWindow!,
      eveningWindow: draft.eveningWindow!,
      officeDaysPerWeek: draft.officeDaysPerWeek!,
      preferredDays: draft.preferredDays!,
      confirmedOfficeDays: {},
      rainThreshold: draft.rainThreshold ?? 40,
      onboardingComplete: true,
      configVersion: 1,
    };
    setConfig(finalConfig);
    navigate('/', { replace: true });
  }

  const meta = STEP_META[step - 1];
  const canAdvance = isStepValid(step, draft);

  return (
    <div className="min-h-dvh flex flex-col px-6 py-8">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8">
        <svg viewBox="0 0 32 32" fill="none" className="size-10 shrink-0">
          <path
            d="M8 22C5.24 22 3 19.76 3 17c0-2.42 1.72-4.44 4.03-4.9A7 7 0 0 1 14 6a6.97 6.97 0 0 1 6.8 5.4A5 5 0 0 1 26 16.5c0 3.04-2.46 5.5-5.5 5.5H8Z"
            className="fill-primary"
          />
          <line x1="10" y1="25" x2="8"  y2="29" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="25" x2="14" y2="29" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="25" x2="20" y2="29" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="leading-none">
          <p className="text-2xl font-bold tracking-tight">
            <span className="text-foreground">Elak</span>
            <span className="text-primary">Hujan</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Perancang hujan untuk rider</p>
        </div>
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i + 1 === step
                ? 'w-6 bg-primary'
                : i + 1 < step
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted-foreground/25',
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {step === 1 && <StepLocation draft={draft} onUpdate={updateDraft} />}
        {step === 2 && <StepCommute draft={draft} onUpdate={updateDraft} />}
        {step === 3 && <StepDays draft={draft} onUpdate={updateDraft} />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            {copy.onboarding.back}
          </Button>
        )}
        <Button
          className={step === 1 ? 'w-full' : 'flex-1'}
          onClick={handleNext}
          disabled={!canAdvance}
        >
          {step === TOTAL_STEPS ? copy.onboarding.finish : copy.onboarding.next}
        </Button>
      </div>
    </div>
  );
}
