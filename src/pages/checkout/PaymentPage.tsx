import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Clock, Upload, Wallet } from 'lucide-react'
import { Select } from '../../components/ui/Select'
import { OrderStatusPill } from '../../features/checkout/OrderStatusPill'
import { useCheckout } from '../../hooks/useCheckout'
import { loadCheckoutContact, loadPreferredMethod } from '../../lib/checkoutSession'
import { formatDateTime } from '../../lib/formatDate'
import { formatMoney } from '../../lib/money'
import { appPaths } from '../../router/paths'

interface PaymentErrors {
  amount?: string
  methodId?: string
  payerPhone?: string
}

export function PaymentPage() {
  const { checkoutNumber = '' } = useParams()
  const { authenticated, busy, checkout, error, loadMethods, methods, payment, reopen, submitPayment } = useCheckout()

  const [methodId, setMethodId] = useState('')
  const [reference, setReference] = useState('')
  const [payerPhone, setPayerPhone] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<PaymentErrors>({})

  // Preselect whatever they picked while reviewing the order.
  useEffect(() => {
    if (methodId || !methods.length) return
    const preferred = loadPreferredMethod()
    if (preferred && methods.some((method) => method.id === preferred)) setMethodId(preferred)
  }, [methodId, methods])

  function clear(field: keyof PaymentErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }
  const [proof, setProof] = useState<File | null>(null)
  const [contact, setContact] = useState(loadCheckoutContact)

  useEffect(() => {
    void loadMethods()
  }, [loadMethods])

  useEffect(() => {
    if (!checkoutNumber) return
    if (!authenticated && !loadCheckoutContact()) return
    void reopen(checkoutNumber)
  }, [authenticated, checkoutNumber, reopen])

  useEffect(() => {
    if (!methodId && methods.length) setMethodId(methods[0].id)
  }, [methodId, methods])

  // Default to settling the balance; the buyer can lower it to a deposit.
  useEffect(() => {
    if (checkout && !amount) setAmount(String(checkout.amountDue))
  }, [amount, checkout])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found: PaymentErrors = {}
    if (!methodId) found.methodId = 'Choose the payment method you used.'
    if (!payerPhone.trim()) found.payerPhone = 'Enter the account you paid from.'

    const paying = Number(amount)
    if (!amount.trim()) found.amount = 'Enter how much you sent.'
    else if (!Number.isFinite(paying) || paying <= 0) found.amount = 'Enter a valid amount.'
    else if (checkout && paying > checkout.amountDue) {
      found.amount = `Only ${formatMoney(checkout.amountDue)} is outstanding.`
    }

    setErrors(found)
    if (Object.keys(found).length) return

    await submitPayment({
      amount: paying,
      note: note.trim() || null,
      payerEmail: authenticated ? null : contact,
      payerAccount: payerPhone.trim() || null,
      paymentMethodId: methodId,
      proof,
      transactionReference: reference.trim() || null,
    })
  }

  if (payment) {
    return (
      <main className="page-container py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.04em] text-ink">Payment submitted</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          We are verifying {formatMoney(payment.amount)} for checkout {payment.orderNumber}. You will get an email
          the moment it is confirmed.
        </p>
        <Link className="primary-button mt-6" to={appPaths.orders}>View your orders</Link>
      </main>
    )
  }

  if (!authenticated && !checkout) {
    return (
      <main className="page-container max-w-md py-16">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-ink">Open your checkout</h1>
        <p className="mt-2 text-sm text-muted">
          Confirm the email you used for checkout {checkoutNumber} to continue paying.
        </p>
        <form
          className="surface-card mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            void reopen(checkoutNumber, contact)
          }}
        >
          <label className="block">
            <span className="form-label">Email address</span>
            <span className="form-input">
              <input
                onChange={(event) => setContact(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={contact}
              />
            </span>
          </label>
          {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-700">{error}</p>}
          <button className="primary-button mt-5 w-full" disabled={busy} type="submit">
            {busy ? 'Opening…' : 'Continue'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-soft/50 py-6 sm:py-8">
      <div className="page-container">
        <h1 className="text-xl font-black tracking-[-0.03em] text-ink sm:text-2xl">Complete your payment</h1>
        <p className="mt-2 text-sm text-muted">Checkout {checkoutNumber}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="surface-card space-y-5" onSubmit={submit}>
            <div>
              <span className="form-label">
                Payment method<span aria-hidden className="ml-0.5 text-red-600">*</span>
              </span>
              <Select
                className={errors.methodId ? 'border-red-400' : ''}
                onChange={(value) => { setMethodId(value); clear('methodId') }}
                options={methods.map((method) => ({ label: method.name, value: method.id }))}
                placeholder="Choose how you paid"
                value={methodId}
              />
              {errors.methodId && <p className="mt-1.5 text-[11px] font-bold text-red-600" role="alert">{errors.methodId}</p>}
              {methods.find((method) => method.id === methodId)?.description && (
                <p className="mt-2 whitespace-pre-line rounded-xl bg-soft px-4 py-3 text-[11px] text-muted">
                  {methods.find((method) => method.id === methodId)?.description}
                </p>
              )}
            </div>

            <label className="block">
              <span className="form-label">
                Amount you sent<span aria-hidden className="ml-0.5 text-red-600">*</span>
              </span>
              <span className={`form-input ${errors.amount ? 'border-red-400' : ''}`}>
                <input
                  inputMode="decimal"
                  onChange={(event) => { setAmount(event.target.value); setErrors((c) => ({ ...c, amount: '' })) }}
                  placeholder="0"
                  value={amount}
                />
              </span>
              {errors.amount ? (
                <span className="mt-1.5 block text-[11px] font-bold text-red-600" role="alert">{errors.amount}</span>
              ) : (
                checkout && (
                  <span className="mt-1.5 block text-[11px] text-muted">
                    {checkout.amountDue === checkout.totalAmount
                      ? `Pay at least ${formatMoney(checkout.requiredNow)} to get this order confirmed.`
                      : `${formatMoney(checkout.amountDue)} outstanding.`}
                  </span>
                )
              )}
            </label>

            <label className="block">
              <span className="form-label">
                Payment account<span aria-hidden className="ml-0.5 text-red-600">*</span>
              </span>
              <span className={`form-input ${errors.payerPhone ? 'border-red-400' : ''}`}>
                <Wallet className="shrink-0 text-muted" size={15} />
                <input
                  onChange={(event) => { setPayerPhone(event.target.value); clear('payerPhone') }}
                  placeholder="Mobile money number or bank account number"
                  value={payerPhone}
                />
              </span>
              {errors.payerPhone ? (
                <span className="mt-1.5 block text-[11px] font-bold text-red-600" role="alert">{errors.payerPhone}</span>
              ) : (
                <span className="mt-1.5 block text-[11px] text-muted">
                  The account you paid from, so we can match your payment.
                </span>
              )}
            </label>

            <label className="block">
              <span className="form-label">Transaction reference</span>
              <span className="form-input">
                <input
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="The code from your payment confirmation"
                  value={reference}
                />
              </span>
            </label>

            <label className="block">
              <span className="form-label">Proof of payment</span>
              <span className="form-input">
                <Upload className="text-muted" size={16} />
                <input
                  accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
                  onChange={(event) => setProof(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </span>
              <span className="mt-1.5 block text-[11px] text-muted">JPG, PNG, WEBP, AVIF or PDF up to 5MB.</span>
            </label>

            <label className="block">
              <span className="form-label">Note for our team (optional)</span>
              <span className="form-input">
                <textarea onChange={(event) => setNote(event.target.value)} rows={2} value={note} />
              </span>
            </label>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[11px] font-bold text-red-700">{error}</p>}

            <button className="primary-button w-full" disabled={busy} type="submit">
              {busy ? 'Submitting…' : 'Submit payment'}
            </button>
          </form>

          <aside className="h-fit surface-card lg:sticky lg:top-24">
            <h2 className="text-sm font-black text-ink">What you are paying for</h2>
            {checkout ? (
              <>
                <div className="mt-4 flex items-start justify-between gap-3 border-b border-line pb-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">{checkout.productName}</p>
                    <p className="truncate text-[11px] text-muted">
                      {checkout.variantName ? `${checkout.variantName} · ` : ''}{checkout.shopName} · × {checkout.quantity}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">{checkout.orderNumber}</p>
                  </div>
                  <strong className="shrink-0 text-xs text-ink">{formatMoney(checkout.totalAmount)}</strong>
                </div>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between"><dt className="text-muted">Items</dt><dd>{formatMoney(checkout.unitPrice * checkout.quantity)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>-{formatMoney(checkout.discountAmount)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatMoney(checkout.deliveryFee)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-2 text-sm font-black text-ink">
                    <dt>Total</dt><dd>{formatMoney(checkout.totalAmount)}</dd>
                  </div>
                  {checkout.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between"><dt className="text-muted">Already paid</dt><dd>{formatMoney(checkout.amountPaid)}</dd></div>
                      <div className="flex justify-between font-bold text-ink"><dt>Still due</dt><dd>{formatMoney(checkout.amountDue)}</dd></div>
                    </>
                  )}
                </dl>
                <div className="mt-4 flex items-center justify-between">
                  <OrderStatusPill status={checkout.status} />
                  {checkout.expiresAt && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                      <Clock size={13} /> Hold ends {formatDateTime(checkout.expiresAt)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-4 text-xs text-muted">Loading your checkout…</p>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
