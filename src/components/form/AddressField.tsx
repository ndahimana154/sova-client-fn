import { Hash, Loader2, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { resolvePlace, suggestPlaces, type PlaceSuggestion } from '../../lib/places'

export interface AddressValue {
  addressHouseNumber: string
  addressLabel: string
  addressLatitude: string | null
  addressLongitude: string | null
  addressPlaceId: string | null
}

interface AddressFieldProps {
  label?: string
  onChange: (value: AddressValue) => void
  value: AddressValue
}

export function AddressField({ label = 'Street or area', onChange, value }: AddressFieldProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const typed = useRef(false)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!typed.current || value.addressLabel.trim().length < 3) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    setBusy(true)
    const timer = window.setTimeout(async () => {
      const results = await suggestPlaces(value.addressLabel, controller.signal)
      if (controller.signal.aborted) return
      setSuggestions(results)
      setBusy(false)
    }, 300)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      setBusy(false)
    }
  }, [value.addressLabel])

  function typeStreet(street: string) {
    typed.current = true
    setOpen(true)
    onChange({
      ...value,
      addressLabel: street,
      addressLatitude: null,
      addressLongitude: null,
      addressPlaceId: null,
    })
  }

  function choose(suggestion: PlaceSuggestion) {
    typed.current = false
    setOpen(false)
    setSuggestions([])
    const place = resolvePlace(suggestion)
    onChange({
      ...value,
      addressLabel: place.label,
      addressLatitude: place.latitude,
      addressLongitude: place.longitude,
      addressPlaceId: place.placeId,
    })
  }

  const located = Boolean(value.addressPlaceId || value.addressLatitude)

  return (
    <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
      <label className="block">
        <span className="form-label">House no.</span>
        <span className="form-input">
          <Hash className="shrink-0 text-muted" size={15} />
          <input
            autoComplete="off"
            onChange={(event) => onChange({ ...value, addressHouseNumber: event.target.value })}
            placeholder="97"
            value={value.addressHouseNumber}
          />
        </span>
      </label>

      <div className="relative" ref={container}>
        <span className="form-label">{label}</span>
        <span className="form-input">
          <MapPin className="shrink-0 text-muted" size={15} />
          <input
            autoComplete="off"
            onChange={(event) => typeStreet(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="KK 19 Ave, Kigali"
            value={value.addressLabel}
          />
          {busy && <Loader2 className="shrink-0 animate-spin text-muted" size={14} />}
        </span>

        <span className="mt-1 block text-[10px] leading-4 text-muted">
          {located
            ? 'Location pinned — couriers get exact directions.'
            : 'Search the street or area and pick a suggestion to pin it on the map.'}
        </span>

        {open && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg">
            {suggestions.map((suggestion) => (
              <li key={suggestion.placeId}>
                <button
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-[11px] leading-4 text-ink transition hover:bg-soft"
                  onClick={() => choose(suggestion)}
                  type="button"
                >
                  <MapPin className="mt-0.5 shrink-0 text-muted" size={13} />
                  {suggestion.description}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
