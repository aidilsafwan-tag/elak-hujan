import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useWarnings } from '@/hooks/useWarnings';
import type { WeatherWarning } from '@/types/warning';

const DISMISSED_KEY = 'elakhujan_dismissed_warnings';

function getDismissedIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function addDismissed(id: string): void {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids, id]));
  }
}

function warningId(w: WeatherWarning): string {
  return `${w.heading_en}-${w.warning_issue?.issued ?? ''}`;
}

export function WarningAlert() {
  const { warnings } = useWarnings();
  const [dismissedIds, setDismissedIds] = useState<string[]>(getDismissedIds);

  const visible = warnings.filter((w) => !dismissedIds.includes(warningId(w)));
  if (visible.length === 0) return null;

  function dismiss(w: WeatherWarning) {
    const id = warningId(w);
    addDismissed(id);
    setDismissedIds((prev) => [...prev, id]);
  }

  return (
    <div className="space-y-2">
      {visible.map((w) => (
        <div
          key={warningId(w)}
          className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3"
        >
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800 leading-snug">
              {w.heading_en}
            </p>
            {w.text_en && (
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{w.text_en}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(w)}
            className="shrink-0 text-amber-400 hover:text-amber-700 transition-colors p-0.5"
            aria-label="Tutup amaran"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
