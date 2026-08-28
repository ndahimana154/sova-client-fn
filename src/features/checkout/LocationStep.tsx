import { MapPinned } from 'lucide-react'
import { useState } from 'react'
import { LocationPicker } from '../../components/form/LocationPicker'
import type { CheckoutContact } from '../../hooks/useCheckout'

interface LocationStepProps {
  contact: CheckoutContact
  onChange: <Key extends keyof CheckoutContact>(key: Key, value: CheckoutContact[Key]) => void
  onConfirm: (location: { label: string; latitude: string; longitude: string }) => void
  onContinue: () => void
}

export function LocationStep({ contact, onChange, onConfirm, onContinue }: LocationStepProps) {
  const [error, setError] = useState('')

  function attemptContinue() {
    if (!contact.deliveryGateConfirmed) {
      setError('Pick your delivery location on the map and confirm it.')
      return
    }
    setError('')
    onContinue()
  }

  return (
    <div className="space-y-4">
      <p className="form-label">
        Delivery location<span aria-hidden className="ml-0.5 text-red-600">*</span>
      </p>
      {contact.deliveryGateConfirmed ? (
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-line bg-primary-light px-3.5 py-3">
          <span className="inline-flex min-w-0 items-start gap-1.5 text-[11px] font-bold text-primary-dark">
            <MapPinned className="mt-px shrink-0" size={13} />
            <span className="min-w-0 break-words">{contact.deliveryAddress || 'Location selected'}</span>
          </span>
          <button
            className="shrink-0 text-[11px] font-bold text-primary-dark hover:underline"
            onClick={() => onChange('deliveryGateConfirmed', false)}
            type="button"
          >
            Change
          </button>
        </div>
      ) : (
        <LocationPicker
          label={contact.deliveryAddress || null}
          latitude={contact.deliveryLatitude ?? null}
          longitude={contact.deliveryLongitude ?? null}
          onConfirm={(location) => { setError(''); onConfirm(location) }}
        />
      )}

      <label className="block">
        <span className="form-label">Delivery note</span>
        <span className="form-input">
          <textarea
            onChange={(event) => onChange('deliveryNote', event.target.value)}
            placeholder="House number, gate colour, landmarks — anything that helps the courier"
            rows={2}
            value={contact.deliveryNote}
          />
        </span>
      </label>

      {error && !contact.deliveryGateConfirmed && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700" role="alert">{error}</p>
      )}

      <div className="flex justify-end">
        <button className="primary-button" onClick={attemptContinue} type="button">
          Continue to review
        </button>
      </div>
    </div>
  )
}
