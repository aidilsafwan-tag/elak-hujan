import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useWarnings } from '@/hooks/useWarnings';
import { cn } from '@/lib/utils';
import type { WeatherWarning } from '@/types/warning';

const DISMISSED_KEY = 'elakhujan_dismissed_warnings';

function getDismissedIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function batchId(warnings: WeatherWarning[]): string {
  return warnings.map((w) => `${w.heading_en}-${w.warning_issue?.issued ?? ''}`).join('|');
}

function addDismissed(id: string): void {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids, id]));
  }
}

export function WarningAlert() {
  const { warnings } = useWarnings();
  const [dismissedBatch, setDismissedBatch] = useState<string[]>(getDismissedIds);
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const id = batchId(warnings);
  if (dismissedBatch.includes(id)) return null;

  function dismiss() {
    addDismissed(id);
    setDismissedBatch((prev) => [...prev, id]);
  }

  const first = warnings[0];
  const rest = warnings.slice(1);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Main row */}
      <div className="flex items-start gap-2.5 p-3">
        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 leading-snug">{first.heading_en}</p>
          {first.text_en && !expanded && (
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed line-clamp-2">{first.text_en}</p>
          )}
          {first.text_en && expanded && (
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{first.text_en}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {rest.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5 hover:bg-amber-200 transition-colors"
              aria-label={expanded ? 'Tutup' : `+${rest.length} lagi`}
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {!expanded && `+${rest.length}`}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="text-amber-400 hover:text-amber-700 transition-colors p-0.5"
            aria-label="Tutup amaran"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded: additional warnings */}
      {expanded && rest.length > 0 && (
        <div className={cn('border-t border-amber-200 divide-y divide-amber-200')}>
          {rest.map((w, i) => (
            <div key={i} className="px-3 py-2.5 flex gap-2">
              <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-800 leading-snug">{w.heading_en}</p>
                {w.text_en && (
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{w.text_en}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
