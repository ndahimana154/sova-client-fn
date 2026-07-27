import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileCheck2,
  LoaderCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Store,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  getCells,
  getDistricts,
  getProvinces,
  getSectors,
  getVillages,
  submitShopApplication,
  trackShopApplication,
  type LocationOption,
  type ShopApplicationPayload,
  type SellerApplicationResponse,
} from '../../lib/sellerApi'
import { normalizeApiError } from '../../api/errors'

interface SellerApplicationPageProps {
  onBack: () => void
}

interface ApplicationRecord extends SellerApplicationResponse {
  applicantEmail: string
  submittedAt: string
}

const categories = ['Electronics', 'Fashion', 'Home & living', 'Beauty', 'Groceries', 'Sports', 'Other']

export function SellerApplicationPage({ onBack }: SellerApplicationPageProps) {
  const account = loadAccount()
  const [step, setStep] = useState(1)
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [sectors, setSectors] = useState<LocationOption[]>([])
  const [cells, setCells] = useState<LocationOption[]>([])
  const [villages, setVillages] = useState<LocationOption[]>([])
  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [sectorId, setSectorId] = useState('')
  const [cellId, setCellId] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [application, setApplication] = useState<ApplicationRecord | null>(loadApplication)

  useEffect(() => {
    setLocationLoading(true)
    getProvinces().then(setProvinces).finally(() => setLocationLoading(false))
  }, [])

  useEffect(() => {
    if (!provinceId) {
      setDistricts([])
      return
    }
    setLocationLoading(true)
    getDistricts(provinceId).then(setDistricts).finally(() => setLocationLoading(false))
    setDistrictId('')
    setSectorId('')
    setCellId('')
    setSectors([])
    setCells([])
    setVillages([])
  }, [provinceId])

  useEffect(() => {
    if (!districtId) {
      setSectors([])
      return
    }
    setLocationLoading(true)
    getSectors(districtId).then(setSectors).finally(() => setLocationLoading(false))
    setSectorId('')
    setCellId('')
    setCells([])
    setVillages([])
  }, [districtId])

  useEffect(() => {
    if (!sectorId) {
      setCells([])
      return
    }
    setLocationLoading(true)
    getCells(sectorId).then(setCells).finally(() => setLocationLoading(false))
    setCellId('')
    setVillages([])
  }, [sectorId])

  useEffect(() => {
    if (!cellId) {
      setVillages([])
      return
    }
    setLocationLoading(true)
    getVillages(cellId).then(setVillages).finally(() => setLocationLoading(false))
  }, [cellId])

  useEffect(() => {
    const applicationCode = application?.applicationCode
    if (!applicationCode) return
    trackShopApplication(applicationCode)
      .then((remote) => {
        setApplication((current) => {
          if (!current) return current
          const updated = { ...current, ...remote }
          localStorage.setItem('sova-seller-application', JSON.stringify(updated))
          return updated
        })
      })
      .catch(() => undefined)
  }, [application?.applicationCode])

  const progress = useMemo(() => `${Math.round((step / 3) * 100)}%`, [step])

  function continueToNextStep(event: MouseEvent<HTMLButtonElement>) {
    const section = event.currentTarget.form?.querySelector<HTMLElement>(`[data-application-step="${step}"]`)
    const fields = Array.from(section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea') ?? [])
    const invalidField = fields.find((field) => !field.checkValidity())
    if (invalidField) {
      invalidField.reportValidity()
      return
    }
    setStep((current) => current + 1)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const registrationDocument = data.get('rbdRegistrationDocument')
    const logo = data.get('logo')
    if (!(registrationDocument instanceof File) || !registrationDocument.size) {
      setSubmissionError('Please attach the RDB registration document.')
      return
    }
    const payload: ShopApplicationPayload = {
      applicantEmail: account.email,
      applicantName: account.name,
      name: String(data.get('shopName')).trim(),
      email: account.email,
      phone: String(data.get('phone')).trim(),
      description: String(data.get('description')).trim(),
      villageId: String(data.get('villageId')),
      street: String(data.get('street')).trim(),
      googleMapsLocationLink: String(data.get('googleMapsLocationLink')).trim() || undefined,
      tinNumber: String(data.get('tinNumber')).trim(),
      rbdRegistrationDocument: registrationDocument,
      logo: logo instanceof File && logo.size ? logo : undefined,
    }
    setSubmitting(true)
    setSubmissionError('')
    try {
      const response = await submitShopApplication(payload)
      const record: ApplicationRecord = {
        ...response,
        applicantEmail: account.email,
        submittedAt: new Date().toISOString(),
      }
      localStorage.setItem('sova-seller-application', JSON.stringify(record))
      setApplication(record)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmissionError(normalizeApiError(error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (application) {
    return <ApplicationStatus application={application} onBack={onBack} />
  }

  return (
    <main className="min-h-[75vh] bg-soft/60 py-8 sm:py-12">
      <div className="page-container">
        <button className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-primary-dark" onClick={onBack} type="button">
          <ChevronLeft size={16} /> Back to shopping
        </button>

        <div className="mx-auto mt-7 max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl bg-ink p-6 text-white">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary"><Store size={21} /></span>
              <h1 className="mt-5 text-2xl font-black tracking-[-0.04em]">Open your shop on SOVA</h1>
              <p className="mt-3 text-xs leading-5 text-white/60">Apply with your existing customer account. Our team will review your business before your store goes live.</p>
              <div className="mt-7 space-y-5">
                <ProcessStep active={step === 1} complete={step > 1} label="Shop information" number={1} />
                <ProcessStep active={step === 2} complete={step > 2} label="Location" number={2} />
                <ProcessStep active={step === 3} complete={false} label="Documents & submit" number={3} />
              </div>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="flex items-center gap-2 text-[11px] text-white/60"><ShieldCheck size={15} className="text-primary" /> Your application is reviewed securely.</p>
              </div>
            </aside>

            <form className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8" onSubmit={submit}>
              <div className="mb-7">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  <span>Step {step} of 3</span><span>{progress}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-primary transition-all" style={{ width: progress }} /></div>
              </div>

              <div className={step === 1 ? 'block' : 'hidden'} data-application-step="1">
                <FormHeading icon={<Building2 size={20} />} title="Tell us about your shop" copy="Use your current SOVA identity and add the business customers will see." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField icon={<Mail size={15} />} label="Account email" value={account.email} />
                  <ReadOnlyField icon={<BadgeCheck size={15} />} label="Applicant" value={account.name} />
                  <FormField label="Shop name"><input name="shopName" placeholder="Example: Kigali Home Studio" required /></FormField>
                  <FormField label="Business phone"><input name="phone" placeholder="+250 7XX XXX XXX" required type="tel" /></FormField>
                  <FormField label="Main category">
                    <select defaultValue="" name="category" required><option disabled value="">Choose a category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                  </FormField>
                  <FormField className="sm:col-span-2" label="Shop description">
                    <textarea className="min-h-28 resize-y" name="description" placeholder="Describe what you sell, where products come from, and what makes your shop trustworthy." required />
                  </FormField>
                </div>
              </div>

              <div className={step === 2 ? 'block' : 'hidden'} data-application-step="2">
                <FormHeading icon={<MapPin size={20} />} title="Where is the shop located?" copy="Province, district, sector, cell, and village options come directly from the SOVA public location API." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <FormField label="Province">
                    <select name="provinceId" onChange={(event) => setProvinceId(event.target.value)} required value={provinceId}>
                      <option value="">Select province</option>{provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="District">
                    <select disabled={!provinceId} name="districtId" onChange={(event) => setDistrictId(event.target.value)} required value={districtId}>
                      <option value="">Select district</option>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Sector">
                    <select disabled={!districtId} name="sectorId" onChange={(event) => setSectorId(event.target.value)} required value={sectorId}>
                      <option value="">Select sector</option>{sectors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Cell">
                    <select disabled={!sectorId} name="cellId" onChange={(event) => setCellId(event.target.value)} required value={cellId}>
                      <option value="">Select cell</option>{cells.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Village">
                    <select disabled={!cellId} name="villageId" required><option value="">Select village</option>{villages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                  </FormField>
                  <FormField label="Street or building"><input name="street" placeholder="Street, building, or landmark" required /></FormField>
                  <FormField className="sm:col-span-2" label="Google Maps link (optional)"><input name="googleMapsLocationLink" placeholder="https://maps.google.com/..." type="url" /></FormField>
                </div>
                {locationLoading && <p className="mt-4 flex items-center gap-2 text-xs text-muted"><LoaderCircle className="animate-spin" size={14} /> Loading location information…</p>}
              </div>

              <div className={step === 3 ? 'block' : 'hidden'} data-application-step="3">
                <FormHeading icon={<FileCheck2 size={20} />} title="Business verification" copy="Provide the registration information SOVA needs to review your application." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <FormField label="TIN number"><input name="tinNumber" placeholder="Tax identification number" required /></FormField>
                  <UploadField accept="image/png,image/jpeg,image/webp" label="Shop logo (optional)" name="logo" required={false} />
                  <UploadField accept=".pdf,image/png,image/jpeg" label="RDB registration document" name="rbdRegistrationDocument" />
                </div>
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-soft p-4 text-xs leading-5 text-muted">
                  <input className="auth-checkbox mt-0.5" required type="checkbox" />
                  <span>I confirm that this information is accurate and authorize SOVA to review the business details before approving the shop.</span>
                </label>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                {step > 1 ? <button className="secondary-button" onClick={() => setStep((current) => current - 1)} type="button">Previous</button> : <span />}
                {step < 3 ? (
                  <button className="primary-button" onClick={continueToNextStep} type="button">Continue <ArrowRight size={15} /></button>
                ) : (
                  <button className="primary-button min-w-40" disabled={submitting} type="submit">
                    {submitting ? <><LoaderCircle className="animate-spin" size={15} /> Submitting…</> : 'Submit application'}
                  </button>
                )}
              </div>
              {submissionError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{submissionError}</p>}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

function ApplicationStatus({ application, onBack }: { application: ApplicationRecord; onBack: () => void }) {
  return (
    <main className="min-h-[75vh] bg-soft/60 py-10">
      <div className="page-container">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-10">
          <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-dark"><Clock3 size={25} /></span>
          <p className="mt-6 auth-eyebrow">Application received</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">Your shop is awaiting review</h1>
          <p className="mt-3 text-sm leading-6 text-muted">The SOVA team will verify your information and send approval or feedback to <strong className="text-ink">{application.applicantEmail}</strong>. You do not need to create another account.</p>
          <div className="mt-7 grid gap-3 rounded-2xl bg-soft p-5 sm:grid-cols-2">
            <StatusDetail label="Application code" value={application.applicationCode} />
            <StatusDetail label="Shop" value={application.shopName} />
            <StatusDetail label="Submitted" value={new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(application.submittedAt))} />
            <StatusDetail label="Status" value={application.status} />
          </div>
          <div className="mt-8 space-y-5">
            <TimelineItem complete copy="Your application has been saved successfully." title="Application submitted" />
            <TimelineItem copy="SOVA checks identity, documents, location, and shop information." title="Verification in progress" />
            <TimelineItem copy="You will receive approval or actionable feedback using your account email." title="Decision & feedback" />
          </div>
          <FeedbackPanel application={application} />
          <button className="secondary-button mt-7" onClick={onBack} type="button"><ChevronLeft size={15} /> Return to SOVA</button>
        </div>
      </div>
    </main>
  )
}

function FormHeading({ copy, icon, title }: { copy: string; icon: React.ReactNode; title: string }) {
  return <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark">{icon}</span><div><h2 className="text-xl font-black text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{copy}</p></div></div>
}

function FormField({ children, className = '', label }: { children: React.ReactNode; className?: string; label: string }) {
  return <label className={`block ${className}`}><span className="text-xs font-bold text-ink">{label}</span><span className="seller-input">{children}</span></label>
}

function ReadOnlyField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div><span className="text-xs font-bold text-ink">{label}</span><span className="seller-input bg-soft text-muted">{icon}<span className="truncate text-xs">{value}</span></span></div>
}

function UploadField({ accept, label, name, required = true }: { accept: string; label: string; name: string; required?: boolean }) {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [fileError, setFileError] = useState('')

  return (
    <label className="block">
      <span className="text-xs font-bold text-ink">{label}</span>
      <span className={`mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-soft px-3 text-center text-xs transition ${fileError ? 'border-red-300 text-red-700' : fileName ? 'border-green-300 text-green-700' : 'border-ink/20 text-muted hover:border-primary'}`}>
        {fileName ? <CheckCircle2 className="mb-2" size={19} /> : <Upload className="mb-2 text-primary-dark" size={18} />}
        <strong className="max-w-full truncate">{fileName || 'Choose a file'}</strong>
        <span className="mt-1 text-[10px] opacity-70">{fileError || fileSize || (required ? 'Required • maximum 5 MB' : 'Optional • maximum 5 MB')}</span>
        <input
          accept={accept}
          className="sr-only"
          name={name}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) {
              setFileName('')
              setFileSize('')
              setFileError('')
              event.target.setCustomValidity('')
              return
            }
            if (file.size > 5_000_000) {
              setFileName(file.name)
              setFileSize('')
              setFileError('File is larger than 5 MB')
              event.target.setCustomValidity('Choose a file smaller than 5 MB.')
              return
            }
            setFileName(file.name)
            setFileSize(`${(file.size / 1_000_000).toFixed(2)} MB • ready to upload`)
            setFileError('')
            event.target.setCustomValidity('')
          }}
          required={required}
          type="file"
        />
      </span>
    </label>
  )
}

function ProcessStep({ active, complete, label, number }: { active: boolean; complete: boolean; label: string; number: number }) {
  return <div className={`flex items-center gap-3 ${active || complete ? 'text-white' : 'text-white/40'}`}><span className={`grid size-8 place-items-center rounded-full text-xs font-black ${complete ? 'bg-green-500' : active ? 'bg-primary' : 'bg-white/10'}`}>{complete ? <Check size={15} /> : number}</span><span className="text-xs font-bold">{label}</span></div>
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span><strong className="mt-1 block text-sm text-ink">{value}</strong></div>
}

function TimelineItem({ complete = false, copy, title }: { complete?: boolean; copy: string; title: string }) {
  return <div className="flex gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${complete ? 'bg-green-100 text-green-700' : 'bg-soft text-muted'}`}>{complete ? <CheckCircle2 size={16} /> : <Clock3 size={14} />}</span><div><strong className="block text-sm text-ink">{title}</strong><p className="mt-1 text-xs leading-5 text-muted">{copy}</p></div></div>
}

function FeedbackPanel({ application }: { application: ApplicationRecord }) {
  const feedback = [...application.history].reverse().find((item) => item.applicantMessage)?.applicantMessage
  return (
    <div className={`mt-8 rounded-xl border p-4 text-xs leading-5 ${feedback ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
      <strong className="block">{feedback ? 'Message from the SOVA review team' : 'Feedback will appear here'}</strong>
      {feedback || 'If the review team requests a correction, this page will show their message and renewal instructions.'}
    </div>
  )
}

function loadAccount() {
  try {
    const account = JSON.parse(localStorage.getItem('sova-account-settings') || '{}')
    return { name: account.name || 'SOVA customer', email: account.email || 'customer@sova.rw' }
  } catch {
    return { name: 'SOVA customer', email: 'customer@sova.rw' }
  }
}

function loadApplication(): ApplicationRecord | null {
  try {
    const application = JSON.parse(localStorage.getItem('sova-seller-application') || 'null')
    return application?.applicationCode ? application : null
  } catch {
    return null
  }
}
