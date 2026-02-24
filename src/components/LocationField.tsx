import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MALAYSIAN_STATES } from '@/constants/malaysia';
import { copy } from '@/constants/copy';
import { searchLocations, type NominatimResult } from '@/services/nominatim';
import type { Location } from '@/types/config';
import { cn } from '@/lib/utils';

export function normaliseName(displayName: string): string {
  return displayName.split(',').slice(0, 2).join(',').trim();
}

// Maps Nominatim's address.state variants → our display state names.
// Nominatim returns English names like "Federal Territory of Kuala Lumpur",
// "Penang", "Malacca" etc. that don't match our list directly.
const NOMINATIM_STATE_MAP: Record<string, string> = {
  'johor':                                  'Johor',
  'kedah':                                  'Kedah',
  'kelantan':                               'Kelantan',
  'melaka':                                 'Melaka',
  'malacca':                                'Melaka',
  'negeri sembilan':                        'Negeri Sembilan',
  'pahang':                                 'Pahang',
  'perak':                                  'Perak',
  'perlis':                                 'Perlis',
  'pulau pinang':                           'Pulau Pinang',
  'penang':                                 'Pulau Pinang',
  'sabah':                                  'Sabah',
  'sarawak':                                'Sarawak',
  'selangor':                               'Selangor',
  'terengganu':                             'Terengganu',
  'kuala lumpur':                           'W.P. Kuala Lumpur',
  'federal territory of kuala lumpur':      'W.P. Kuala Lumpur',
  'wilayah persekutuan kuala lumpur':       'W.P. Kuala Lumpur',
  'labuan':                                 'W.P. Labuan',
  'federal territory of labuan':            'W.P. Labuan',
  'wilayah persekutuan labuan':             'W.P. Labuan',
  'putrajaya':                              'W.P. Putrajaya',
  'federal territory of putrajaya':         'W.P. Putrajaya',
  'wilayah persekutuan putrajaya':          'W.P. Putrajaya',
};

export function guessState(result: NominatimResult): string {
  const raw = (result.address?.state ?? '').toLowerCase().trim();
  if (!raw) return '';

  // Exact map lookup first
  if (NOMINATIM_STATE_MAP[raw]) return NOMINATIM_STATE_MAP[raw];

  // Partial match within the map keys (handles truncated or variant strings)
  const key = Object.keys(NOMINATIM_STATE_MAP).find(
    (k) => raw.includes(k) || k.includes(raw),
  );
  return key ? NOMINATIM_STATE_MAP[key] : '';
}

interface LocationFieldProps {
  label: string;
  placeholder: string;
  value: Location | undefined;
  onChange: (loc: Location) => void;
}

export function LocationField({ label, placeholder, value, onChange }: LocationFieldProps) {
  const [query, setQuery] = useState(value?.name ?? '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchLocations(query);
        setResults(res);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: NominatimResult) {
    const name = normaliseName(result.display_name);
    const state = guessState(result);
    setQuery(name);
    setShowDropdown(false);
    setResults([]);
    onChange({
      name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      state,
    });
  }

  const hasValidLocation = !!(value?.lat && value?.lon);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Current location chip */}
      {hasValidLocation && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
          <MapPin className="size-3 shrink-0 text-primary" />
          <span className="truncate">{value!.name}</span>
          {value!.state && <span className="shrink-0 text-muted-foreground/60">· {value!.state}</span>}
        </div>
      )}

      {/* Search input + dropdown */}
      <div className="relative" ref={containerRef}>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) {
              setShowDropdown(false);
              setResults([]);
            }
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={hasValidLocation ? 'Cari lokasi baru...' : placeholder}
          autoComplete="off"
        />
        {showDropdown && (
          <div className="absolute z-30 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
            {loading && (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                {copy.onboarding.location.searching}
              </p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                {copy.onboarding.location.noResults}
              </p>
            )}
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                className={cn(
                  'w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors',
                  'border-b border-border last:border-b-0',
                )}
                onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                onClick={() => handleSelect(r)}
              >
                <span className="font-medium">{normaliseName(r.display_name)}</span>
                <span className="block text-xs text-muted-foreground truncate">
                  {r.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State selector — only shown once a location is picked */}
      {hasValidLocation && (
        <Select
          value={value?.state ?? ''}
          onValueChange={(state) => {
            if (value) onChange({ ...value, state });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={copy.onboarding.location.statePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {MALAYSIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
