import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContactStep } from '../../features/checkout/ContactStep'
import { LocationStep } from '../../features/checkout/LocationStep'
import { OrderSummary } from '../../features/checkout/OrderSummary'
import { PaymentPreview } from '../../features/checkout/PaymentPreview'
import { PolicyCheck } from '../../features/checkout/PolicyCheck'
import { StepShell } from '../../features/checkout/StepShell'
import { useBuyerProfile } from '../../hooks/useBuyerProfile'
import { useCheckout, type CheckoutContact } from '../../hooks/useCheckout'
import { useDeliveryPricing } from '../../hooks/useDeliveryPricing'
import { usePolicyVersions } from '../../hooks/usePolicyVersions'
import { formatMoney } from '../../lib/money'
import { isValidPhone } from '../../lib/phone'
import { savePreferredMethod } from '../../lib/checkoutSession'
import { appPaths } from '../../router/paths'
import { useAppSelector } from '../../store/hooks'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emptyContact: CheckoutContact = {
  deliveryAddress: '',
  deliveryGateConfirmed: false,
  deliveryLatitude: null,
  deliveryLongitude: null,
  deliveryNote: '',
  deliveryPlaceId: null,
  recipientEmail: '',
  recipientName: '',
  recipientPhone: '',
}

type Step = 1 | 2 | 3

export function CheckoutPage() {
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.auth.session)
  const { authenticated, busy, error, lines, placeOrder, requestGuestOtp, unavailable, verificationToken, verifyGuestOtp } =
    useCheckout()

  const [contact, setContact] = useState<CheckoutContact>(emptyContact)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptDeliveryTerms, setAcceptDeliveryTerms] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [step, setStep] = useState<Step>(1)
  const [showPolicyErrors, setShowPolicyErrors] = useState(false)
  const [previewMethodId, setPreviewMethodId] = useState('')
  const advanced = useRef(false)

  const { statuses: policyStatuses } = usePolicyVersions()
  const pricing = useDeliveryPricing()
  const { profile } = useBuyerProfile(authenticated)

  useEffect(() => {
    if (!session?.user) return
    setContact((current) => ({
      ...current,
      recipientEmail: session.user.email,
      recipientName: current.recipientName || session.user.name,
    }))
  }, [session?.user])

  // Saved details fill the form once, and only where nothing was typed yet.
  useEffect(() => {
    if (!profile) return
    setContact((current) => ({
      ...current,
      recipientName: current.recipientName || profile.name || '',
      recipientPhone: current.recipientPhone || profile.phone || '',
      deliveryAddress:
        current.deliveryAddress ||
        [profile.addressHouseNumber, profile.addressLabel].filter(Boolean).join(' '),
      deliveryPlaceId: current.deliveryPlaceId ?? profile.addressPlaceId,
      deliveryLatitude: current.deliveryLatitude ?? profile.addressLatitude,
      deliveryLongitude: current.deliveryLongitude ?? profile.addressLongitude,
      deliveryGateConfirmed:
        current.deliveryGateConfirmed || Boolean(profile.addressLatitude && profile.addressLongitude),
    }))

    // Skip ahead only for a buyer whose saved profile is already complete.
    // This is judged from the profile, never from what is being typed, so the
    // open step can never change underneath someone mid-field.
    if (advanced.current) return
    advanced.current = true
    const savedReady =
      Boolean(profile.name?.trim()) &&
      isValidPhone(profile.phone) &&
      Boolean(profile.addressLatitude && profile.addressLongitude)
    if (savedReady) setStep(3)
  }, [profile])

  const subtotal = lines.reduce((total: number, item) => total + item.product.price * item.quantity, 0)
  const verified = authenticated || Boolean(verificationToken)
  const deliveryFee = pricing.freeThreshold > 0 && subtotal >= pricing.freeThreshold ? 0 : pricing.fee
  const total = subtotal + deliveryFee

  const contactDone =
    Boolean(contact.recipientName.trim()) &&
    isValidPhone(contact.recipientPhone) &&
    EMAIL_PATTERN.test(contact.recipientEmail.trim()) &&
    verified
  const locationDone = Boolean(contact.deliveryGateConfirmed)

  const missing = [
    !contactDone && 'your contact details',
    !locationDone && 'a delivery location',
    !acceptTerms && 'the terms and conditions',
    !acceptDeliveryTerms && 'the delivery terms',
  ].filter(Boolean) as string[]

  const canOrder = missing.length === 0 && !busy

  function update<Key extends keyof CheckoutContact>(key: Key, value: CheckoutContact[Key]) {
    setContact((current) => ({ ...current, [key]: value }))
  }

  async function sendCode() {
    const email = contact.recipientEmail.trim()
    if (!email) return setEmailError('Enter your email address first.')
    if (!EMAIL_PATTERN.test(email)) return setEmailError('Enter a valid email address.')
    setEmailError('')
    const sent = await requestGuestOtp(email)
    if (sent) setOtpSent(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Send them back to whatever is unfinished rather than failing silently.
    if (!contactDone) { setStep(1); return }
    if (!locationDone) { setStep(2); return }
    if (!acceptTerms || !acceptDeliveryTerms) {
      setShowPolicyErrors(true)
      setStep(3)
      return
    }

    const created = await placeOrder({ ...contact, acceptTerms, acceptDeliveryTerms })
    if (created) navigate(appPaths.checkoutPayment(created.orderNumber))
  }

  if (!lines.length) {
    return (
      <main className="page-container py-16 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-ink">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted">Pick a product and hit Buy now to start an order.</p>
        <button className="primary-button mt-6" onClick={() => navigate(appPaths.home)}>Continue shopping</button>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-soft/50 pb-28 pt-6 sm:pt-8 lg:pb-8">
      <div className="page-container">
        <h1 className="text-xl font-black tracking-[-0.03em] text-ink sm:text-2xl">Checkout</h1>

        <form className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]" onSubmit={submit}>
          <div className="space-y-3">
            <StepShell
              complete={contactDone}
              index={1}
              onEdit={() => setStep(1)}
              open={step === 1}
              summary={`${contact.recipientName} · ${contact.recipientPhone} · ${contact.recipientEmail}`}
              title="Contact details"
            >
              <ContactStep
                authenticated={authenticated}
                busy={busy}
                contact={contact}
                emailError={emailError}
                onChange={update}
                onConfirmCode={(code) => void verifyGuestOtp(contact.recipientEmail, code)}
                onContinue={() => setStep(2)}
                onSendCode={() => void sendCode()}
                otp={otp}
                otpSent={otpSent}
                setOtp={setOtp}
                verified={verified}
              />
            </StepShell>

            <StepShell
              complete={locationDone}
              index={2}
              onEdit={() => setStep(2)}
              open={step === 2}
              summary={contact.deliveryAddress || 'No location chosen'}
              title="Delivery location"
            >
              <LocationStep
                contact={contact}
                onChange={update}
                onConfirm={(location) =>
                  setContact((current) => ({
                    ...current,
                    deliveryAddress: location.label,
                    deliveryLatitude: location.latitude,
                    deliveryLongitude: location.longitude,
                    deliveryGateConfirmed: true,
                  }))
                }
                onContinue={() => setStep(3)}
              />
            </StepShell>

            <StepShell
              complete={canOrder}
              index={3}
              onEdit={() => setStep(3)}
              open={step === 3}
              title="Review and pay"
            >
              <div className="space-y-3">
                <PaymentPreview
                  authenticated={authenticated}
                  methodId={previewMethodId}
                  onChange={(next) => { setPreviewMethodId(next); savePreferredMethod(next) }}
                />

                <PolicyCheck
                  checked={acceptTerms}
                  error={showPolicyErrors && !acceptTerms ? 'You must accept the terms and conditions.' : undefined}
                  href={appPaths.terms}
                  label="terms and conditions"
                  onChange={(next) => { setAcceptTerms(next); if (next) setShowPolicyErrors(false) }}
                  version={policyStatuses.terms_and_conditions}
                />
                <PolicyCheck
                  checked={acceptDeliveryTerms}
                  error={showPolicyErrors && !acceptDeliveryTerms ? 'You must accept the delivery terms.' : undefined}
                  href={appPaths.deliveryTerms}
                  label="delivery terms"
                  onChange={(next) => { setAcceptDeliveryTerms(next); if (next) setShowPolicyErrors(false) }}
                  version={policyStatuses.delivery_terms}
                />

                {unavailable > 0 && (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-[11px] font-bold text-amber-700">
                    {unavailable} item{unavailable === 1 ? '' : 's'} in your cart no longer have a selected option and
                    will be skipped.
                  </p>
                )}
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-700">{error}</p>}
                {missing.length > 0 && (
                  <p className="rounded-xl bg-soft px-4 py-3 text-[11px] leading-5 text-muted">
                    Still needed: <strong className="text-ink">{missing.join(', ')}</strong>.
                  </p>
                )}

                <button className="primary-button hidden w-full lg:flex" disabled={busy} type="submit">
                  {busy ? 'Placing your order…' : `Place order · ${formatMoney(total)}`}
                </button>
                <p className="hidden text-center text-[11px] text-muted lg:block">
                  Stock is held for you as soon as the order is placed.
                </p>
              </div>
            </StepShell>
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-white p-4 lg:sticky lg:top-24">
            <h2 className="text-xs font-black text-ink">Order summary</h2>
            <div className="mt-3">
              <OrderSummary
                deliveryFee={deliveryFee}
                freeThreshold={pricing.freeThreshold}
                items={lines}
                loaded={pricing.loaded}
                subtotal={subtotal}
                total={total}
              />
            </div>
          </aside>

          {/* Phones keep the price and the action in reach without scrolling. */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
            <div className="page-container flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] text-muted">Total</p>
                <strong className="block text-sm font-black text-ink">{formatMoney(total)}</strong>
              </div>
              <button className="primary-button min-w-0 flex-1" disabled={busy} type="submit">
                {busy ? 'Placing…' : 'Place order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
