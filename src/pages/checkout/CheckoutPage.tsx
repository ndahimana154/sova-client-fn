import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Mail, MapPinned, Phone, Truck, UserRound } from 'lucide-react'
import { LocationPicker } from '../../components/form/LocationPicker'
import { CheckoutField } from '../../features/checkout/CheckoutField'
import { MethodChoice } from '../../features/checkout/MethodChoice'
import { OrderSummary } from '../../features/checkout/OrderSummary'
import { PolicyCheck } from '../../features/checkout/PolicyCheck'
import { VerifyEmailModal } from '../../features/checkout/VerifyEmailModal'
import { contactErrors, type ContactErrors } from '../../features/checkout/validation'
import { useBuyerProfile } from '../../hooks/useBuyerProfile'
import { useCheckout, type CheckoutContact } from '../../hooks/useCheckout'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'
import { usePolicyVersions } from '../../hooks/usePolicyVersions'
import { useShippingMethods } from '../../hooks/useShippingMethods'
import { formatMoney } from '../../lib/money'
import { mediaUrl } from '../../lib/mediaUrl'
import { normalizePhone } from '../../lib/phone'
import { appPaths } from '../../router/paths'
import { useAppSelector } from '../../store/hooks'

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

export function CheckoutPage() {
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.auth.session)
  const {
    authenticated,
    busy,
    error,
    lines,
    placeOrder,
    requestGuestOtp,
    unavailable,
    verificationToken,
    verifyGuestOtp,
  } = useCheckout()

  const [contact, setContact] = useState<CheckoutContact>(emptyContact)
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [shippingMethodId, setShippingMethodId] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptDeliveryTerms, setAcceptDeliveryTerms] = useState(false)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [showErrors, setShowErrors] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otpError, setOtpError] = useState('')

  const { statuses: policyStatuses } = usePolicyVersions()
  const { methods: payments, loading: loadingPayments } = usePaymentMethods(authenticated)
  const { methods: shippings, loading: loadingShipping } = useShippingMethods()
  const { profile } = useBuyerProfile(authenticated)

  useEffect(() => {
    if (!session?.user) return
    setContact((current) => ({
      ...current,
      recipientEmail: session.user.email,
      recipientName: current.recipientName || session.user.name,
    }))
  }, [session?.user])

  useEffect(() => {
    if (!profile) return
    setContact((current) => ({
      ...current,
      recipientName: current.recipientName || profile.name || '',
      recipientPhone: current.recipientPhone || profile.phone || '',
      deliveryAddress: current.deliveryAddress || profile.addressLabel || '',
      deliveryPlaceId: current.deliveryPlaceId ?? profile.addressPlaceId,
      deliveryLatitude: current.deliveryLatitude ?? profile.addressLatitude,
      deliveryLongitude: current.deliveryLongitude ?? profile.addressLongitude,
      deliveryGateConfirmed:
        current.deliveryGateConfirmed ||
        Boolean(profile.addressLabel?.trim() && profile.addressLatitude && profile.addressLongitude),
    }))
  }, [profile])

  useEffect(() => {
    if (!shippingMethodId && shippings.length) setShippingMethodId(shippings[0].id)
  }, [shippingMethodId, shippings])

  const chosenShipping = shippings.find((method) => method.id === shippingMethodId)
  const subtotal = lines.reduce(
    (total: number, item) => total + item.product.price * item.quantity,
    0,
  )
  const locationReady =
    Boolean(contact.deliveryGateConfirmed) && Boolean(contact.deliveryAddress.trim())
  const deliveryFee = chosenShipping?.shippingFee ?? 0
  const total = subtotal + deliveryFee
  const verified = authenticated || Boolean(verificationToken)

  function update<Key extends keyof CheckoutContact>(key: Key, value: CheckoutContact[Key]) {
    setContact((current) => ({ ...current, [key]: value }))
    setShowErrors(false)
  }

  function validate(): boolean {
    const found = contactErrors(contact, true)
    setErrors(found)
    setShowErrors(true)
    const complete =
      !Object.values(found).some(Boolean) &&
      locationReady &&
      Boolean(paymentMethodId) &&
      Boolean(shippingMethodId) &&
      acceptTerms &&
      acceptDeliveryTerms
    return Boolean(complete)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    if (!verified) {
      setOtpError('')
      const sent = await requestGuestOtp(contact.recipientEmail.trim())
      if (sent) setVerifying(true)
      return
    }
    await finish()
  }

  async function finish() {
    const created = await placeOrder({
      ...contact,
      acceptTerms,
      acceptDeliveryTerms,
      paymentMethodId,
      shippingMethodId,
      recipientPhone: normalizePhone(contact.recipientPhone),
    })
    if (created) {
      setVerifying(false)
      navigate(appPaths.orderDetails(created.orderNumber))
    }
  }

  async function confirmCode(code: string) {
    setOtpError('')
    const ok = await verifyGuestOtp(contact.recipientEmail.trim(), code)
    if (!ok) {
      setOtpError('That code is not correct. Try again.')
      return
    }
    await finish()
  }

  if (!lines.length) {
    return (
      <main className="page-container py-16 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-ink">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted">Pick a product and hit Buy now to start an order.</p>
        <button className="primary-button mt-6" onClick={() => navigate(appPaths.home)}>
          Continue shopping
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-soft/50 pb-10 pt-6 sm:pt-8">
      <div className="page-container">
        <h1 className="text-xl font-black tracking-[-0.03em] text-ink sm:text-2xl">Checkout</h1>
        <p className="mt-1 text-xs text-muted">
          Confirm where this goes, how it ships, and how you will pay.
        </p>

        {unavailable > 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] font-bold text-amber-800">
            That product is no longer available to order.
          </p>
        )}

        <form className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate onSubmit={submit}>
          <div className="space-y-4">
            <Section icon={<UserRound size={15} />} title="Your details">
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckoutField
                  error={showErrors ? errors.recipientName : undefined}
                  icon={<UserRound size={15} />}
                  label="Full name"
                  required
                >
                  <input
                    autoComplete="name"
                    onChange={(event) => update('recipientName', event.target.value)}
                    placeholder="Your full name"
                    value={contact.recipientName}
                  />
                </CheckoutField>

                <CheckoutField
                  error={showErrors ? errors.recipientPhone : undefined}
                  icon={<Phone size={15} />}
                  label="Phone number"
                  required
                >
                  <input
                    autoComplete="tel"
                    onChange={(event) => update('recipientPhone', event.target.value)}
                    placeholder="07xx xxx xxx"
                    value={contact.recipientPhone}
                  />
                </CheckoutField>

                <div className="sm:col-span-2">
                  <CheckoutField
                    error={showErrors ? errors.recipientEmail : undefined}
                    icon={<Mail size={15} />}
                    label="Email address"
                    required
                  >
                    <input
                      autoComplete="email"
                      disabled={authenticated}
                      onChange={(event) => update('recipientEmail', event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      value={contact.recipientEmail}
                    />
                  </CheckoutField>
                  {!authenticated && (
                    <p className="mt-1.5 text-[11px] text-muted">
                      We confirm this with a code when you place the order.
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section icon={<MapPinned size={15} />} required title="Delivery location">
              {locationReady ? (
                <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-line bg-primary-light px-3.5 py-3">
                  <span className="inline-flex min-w-0 items-start gap-1.5 text-[11px] font-bold text-primary-dark">
                    <MapPinned className="mt-px shrink-0" size={13} />
                    <span className="min-w-0 break-words">{contact.deliveryAddress}</span>
                  </span>
                  <button
                    className="shrink-0 text-[11px] font-bold text-primary-dark hover:underline"
                    onClick={() => update('deliveryGateConfirmed', false)}
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
                  onConfirm={(location) =>
                    setContact((current) => ({
                      ...current,
                      deliveryAddress: location.label,
                      deliveryLatitude: location.latitude,
                      deliveryLongitude: location.longitude,
                      deliveryGateConfirmed: true,
                    }))
                  }
                />
              )}

              {showErrors && !locationReady && (
                <p className="mt-2 text-[11px] font-bold text-red-600" role="alert">
                  Pick your delivery location on the map, then press Confirm so the courier
                  knows where to bring this order.
                </p>
              )}

              <label className="mt-3 block">
                <span className="form-label">Delivery note</span>
                <span className="form-input">
                  <textarea
                    onChange={(event) => update('deliveryNote', event.target.value)}
                    placeholder="House number, gate colour, landmarks — anything that helps the courier"
                    rows={2}
                    value={contact.deliveryNote}
                  />
                </span>
              </label>
            </Section>

            <Section icon={<Truck size={15} />} required title="Shipping method">
              {loadingShipping && <p className="text-[11px] text-muted">Loading shipping options…</p>}
              {!loadingShipping && !shippings.length && (
                <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] font-bold text-amber-800">
                  No shipping methods are available right now. Please try again shortly.
                </p>
              )}
              <div className="space-y-2">
                {shippings.map((method) => (
                  <MethodChoice
                    aside={
                      <span className="text-xs font-black text-ink">
                        {method.shippingFee === 0 ? 'Free' : formatMoney(method.shippingFee)}
                      </span>
                    }
                    description={[
                      method.description,
                      estimate(method.estimatedDaysMin, method.estimatedDaysMax),
                    ]
                      .filter(Boolean)
                      .join('\n')}
                    error={showErrors && !shippingMethodId}
                    key={method.id}
                    onSelect={() => setShippingMethodId(method.id)}
                    selected={shippingMethodId === method.id}
                    title={method.title}
                  />
                ))}
              </div>
              {showErrors && !shippingMethodId && (
                <p className="mt-2 text-[11px] font-bold text-red-600" role="alert">
                  Choose how this order should be shipped.
                </p>
              )}
            </Section>

            <Section icon={<CreditCard size={15} />} required title="Payment method">
              <p className="mb-2.5 text-[11px] leading-5 text-muted">
                Pick how you will pay. Our team confirms your payment before the order is packed,
                and the instructions for your choice are shown below.
              </p>
              {loadingPayments && <p className="text-[11px] text-muted">Loading payment options…</p>}
              <div className="space-y-2">
                {payments.map((method) => (
                  <MethodChoice
                    description={method.description}
                    error={showErrors && !paymentMethodId}
                    key={method.id}
                    logo={
                      method.logo ? (
                        <img
                          alt=""
                          className="size-8 shrink-0 rounded-lg border border-line bg-white object-contain p-1"
                          src={mediaUrl(method.logo)}
                        />
                      ) : undefined
                    }
                    onSelect={() => setPaymentMethodId(method.id)}
                    selected={paymentMethodId === method.id}
                    title={method.name}
                  />
                ))}
              </div>
              {showErrors && !paymentMethodId && (
                <p className="mt-2 text-[11px] font-bold text-red-600" role="alert">
                  Choose how you will pay for this order.
                </p>
              )}
            </Section>
          </div>

          <aside className="h-fit space-y-3 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-line bg-white p-4">
              <h2 className="text-xs font-black uppercase tracking-[0.12em] text-muted">
                Order summary
              </h2>
              <div className="mt-3">
                <OrderSummary
                  deliveryFee={deliveryFee}
                  freeThreshold={0}
                  items={lines}
                  loaded={!loadingShipping}
                  subtotal={subtotal}
                  total={total}
                />
              </div>

              <div className="mt-4 space-y-2 border-t border-line pt-3.5">
                <PolicyCheck
                  checked={acceptTerms}
                  error={showErrors && !acceptTerms ? 'You must accept the terms.' : undefined}
                  href={appPaths.terms}
                  label="terms and conditions"
                  onChange={setAcceptTerms}
                  version={policyStatuses.terms_and_conditions}
                />
                <PolicyCheck
                  checked={acceptDeliveryTerms}
                  error={
                    showErrors && !acceptDeliveryTerms ? 'You must accept the delivery terms.' : undefined
                  }
                  href={appPaths.deliveryTerms}
                  label="delivery terms"
                  onChange={setAcceptDeliveryTerms}
                  version={policyStatuses.delivery_terms}
                />
              </div>

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">
                  {error}
                </p>
              )}

              <button className="primary-button mt-4 w-full" disabled={busy} type="submit">
                {busy ? 'Placing order…' : `Place order · ${formatMoney(total)}`}
              </button>
              <p className="mt-2 text-center text-[10px] leading-4 text-muted">
                Stock is held for you as soon as the order is placed.
              </p>
            </section>
          </aside>
        </form>
      </div>

      {verifying && (
        <VerifyEmailModal
          busy={busy}
          email={contact.recipientEmail.trim()}
          error={otpError}
          onClose={() => setVerifying(false)}
          onResend={() => void requestGuestOtp(contact.recipientEmail.trim())}
          onVerify={(code) => void confirmCode(code)}
          verified={verified}
        />
      )}
    </main>
  )
}

function Section({
  children,
  icon,
  required,
  title,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  required?: boolean
  title: string
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-black text-ink">
        <span className="grid size-7 place-items-center rounded-full bg-primary-light text-primary-dark">
          {icon}
        </span>
        {title}
        {required && <span aria-hidden className="text-red-600">*</span>}
      </h2>
      {children}
    </section>
  )
}

function estimate(min: number | null, max: number | null): string {
  if (min === null && max === null) return ''
  if (min !== null && max !== null && min !== max) return `Arrives in ${min}–${max} working days`
  const days = min ?? max
  return `Arrives in ${days} working day${days === 1 ? '' : 's'}`
}
