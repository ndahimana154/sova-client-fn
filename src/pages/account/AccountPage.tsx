import { CalendarDays, ExternalLink, Mail, Phone, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LocationField, type LocationValue } from '../../components/form/LocationField'
import { PhoneField } from '../../components/form/PhoneField'
import type { BuyerProfileContext } from '../../components/layout/AccountLayout'
import { useAuthActions } from '../../hooks/useAuthActions'
import { PHONE_HINT, normalizePhone, validatePhone } from '../../lib/phone'
import type { UpdateBuyerProfileInput } from '../../lib/profileApi'

export function AccountPage() {
  const { notify } = useAuthActions()
  const { error, loading, profile, save, saving } = useOutletContext<BuyerProfileContext>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [address, setAddress] = useState<LocationValue>({
    addressLabel: '',
    addressLatitude: null,
    addressLongitude: null,
    addressPlaceId: null,
  })

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? '')
    setPhone(profile.phone ?? '')
    setDateOfBirth(profile.dateOfBirth ?? '')
    setAddress({
      addressLabel: profile.addressLabel ?? '',
      addressLatitude: profile.addressLatitude,
      addressLongitude: profile.addressLongitude,
      addressPlaceId: profile.addressPlaceId,
    })
  }, [profile])

  const patch = useMemo<UpdateBuyerProfileInput>(() => {
    const next: UpdateBuyerProfileInput = {}
    if (name.trim() !== (profile?.name ?? '')) next.name = name.trim()
    if (normalizePhone(phone) !== (profile?.phone ?? '')) next.phone = normalizePhone(phone)
    if (dateOfBirth !== (profile?.dateOfBirth ?? '')) next.dateOfBirth = dateOfBirth
    const movedPin =
      address.addressLabel.trim() !== (profile?.addressLabel ?? '') ||
      (address.addressLatitude ?? '') !== (profile?.addressLatitude ?? '') ||
      (address.addressLongitude ?? '') !== (profile?.addressLongitude ?? '')
    if (movedPin) {
      next.addressLabel = address.addressLabel.trim()
      next.addressPlaceId = address.addressPlaceId ?? ''
      next.addressLatitude = address.addressLatitude ?? ''
      next.addressLongitude = address.addressLongitude ?? ''
    }
    return next
  }, [address, dateOfBirth, name, phone, profile])

  const dirty = Object.keys(patch).length > 0

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dirty) return
    const invalid = validatePhone(phone, { required: false })
    if (invalid) { setPhoneError(invalid); return }
    setPhoneError('')
    if (await save(patch)) notify('Profile updated')
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-base font-black text-ink">Account settings</h1>
          <p className="text-[11px] text-muted">Used for your deliveries and receipts.</p>
        </div>

        {loading ? (
          <p className="mt-5 text-xs text-muted">Loading your profile…</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="form-label">Full name</span>
              <span className="form-input">
                <UserRound className="shrink-0 text-muted" size={15} />
                <input autoComplete="name" onChange={(e) => setName(e.target.value)} placeholder="Your full name" value={name} />
              </span>
            </label>

            <label className="block">
              <span className="form-label">Email</span>
              <span className="form-input bg-soft/60">
                <Mail className="shrink-0 text-muted" size={15} />
                <input disabled readOnly value={profile?.email ?? ''} />
              </span>
              <span className="mt-1 block text-[10px] text-muted">Your sign-in address.</span>
            </label>

            <label className="block">
              <span className="form-label">Phone</span>
              <span className={`form-input ${phoneError ? 'border-red-400' : ''}`}>
                <Phone className="shrink-0 text-muted" size={15} />
                <PhoneField
                  onChange={(next) => { setPhone(next); setPhoneError('') }}
                  value={phone}
                />
              </span>
              {phoneError ? (
                <span className="mt-1 block text-[11px] font-bold text-red-600" role="alert">{phoneError}</span>
              ) : (
                <span className="mt-1 block text-[10px] text-muted">{PHONE_HINT}</span>
              )}
            </label>

            <label className="block">
              <span className="form-label">Date of birth</span>
              <span className="form-input">
                <CalendarDays className="shrink-0 text-muted" size={15} />
                <input
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  type="date"
                  value={dateOfBirth}
                />
              </span>
            </label>

            <div className="sm:col-span-2">
              <span className="form-label">Delivery location</span>
              <div className="mt-1.5">
                <LocationField
                  confirmLabel="Save this location"
                  searchPlaceholder="Search your street, building or landmark"
                  hint="Checkout uses this by default. Place the pin where a courier should meet you."
                  onChange={setAddress}
                  value={address}
                />
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
            {profile?.mapsUrl && (
              <a className="inline-flex items-center gap-1 font-bold text-primary-dark hover:underline" href={profile.mapsUrl} rel="noreferrer" target="_blank">
                <ExternalLink size={11} /> View saved location
              </a>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">{error}</p>
        )}

        <div className="mt-5 flex justify-end border-t border-line pt-4">
          <button className="primary-button min-w-32" disabled={!dirty || saving} type="submit">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </section>
    </form>
  )
}
