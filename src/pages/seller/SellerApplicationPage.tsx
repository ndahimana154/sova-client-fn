import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Edit3,
  FileCheck2,
  LoaderCircle,
  MapPin,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { createContext, isValidElement, useContext, useEffect, useState, type FormEvent } from 'react'
import {
  getCells,
  getDistricts,
  getLocationTree,
  getProvinces,
  getSectors,
  getVillages,
  renewShopApplication,
  sellerResourceUrl,
  submitShopApplication,
  trackShopApplication,
  type LocationOption,
  type LocationTreeProvince,
  type ShopApplicationPayload,
  type SellerApplicationResponse,
} from '../../lib/sellerApi'
import { normalizeApiError } from '../../api/errors'

interface SellerApplicationPageProps {
  onBack: () => void
}

interface ApplicationRecord extends SellerApplicationResponse {
  applicantEmail?: string
  submittedAt: string
}

const ValidationErrorsContext = createContext<Record<string, string>>({})

export function SellerApplicationPage({ onBack }: SellerApplicationPageProps) {
  const account = loadAccount()
  const [provinces, setProvinces] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [sectors, setSectors] = useState<LocationOption[]>([])
  const [cells, setCells] = useState<LocationOption[]>([])
  const [villages, setVillages] = useState<LocationOption[]>([])
  const [provinceId, setProvinceId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [sectorId, setSectorId] = useState('')
  const [cellId, setCellId] = useState('')
  const [villageId, setVillageId] = useState('')
  const [locationHydrated, setLocationHydrated] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [submissionSuccess, setSubmissionSuccess] = useState('')
  const [formVersion, setFormVersion] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [tracking, setTracking] = useState(false)
  const [trackingError, setTrackingError] = useState('')
  const [application, setApplication] = useState<ApplicationRecord | null>(null)
  const [renewalApplication, setRenewalApplication] = useState<ApplicationRecord | null>(null)

  useEffect(() => {
    localStorage.removeItem('sova-seller-application')
  }, [])

  useEffect(() => {
    setLocationLoading(true)
    getProvinces()
      .then((items) => {
        setProvinces(items)
        setLocationError('')
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false))
  }, [])

  useEffect(() => {
    if (locationHydrated) return
    if (!provinceId) {
      setDistricts([])
      return
    }
    setLocationLoading(true)
    getDistricts(provinceId)
      .then((items) => {
        setDistricts(items)
        setLocationError('')
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false))
    setDistrictId('')
    setSectorId('')
    setCellId('')
    setSectors([])
    setCells([])
    setVillages([])
  }, [locationHydrated, provinceId])

  useEffect(() => {
    if (locationHydrated) return
    if (!districtId) {
      setSectors([])
      return
    }
    setLocationLoading(true)
    getSectors(districtId)
      .then((items) => {
        setSectors(items)
        setLocationError('')
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false))
    setSectorId('')
    setCellId('')
    setCells([])
    setVillages([])
  }, [districtId, locationHydrated])

  useEffect(() => {
    if (locationHydrated) return
    if (!sectorId) {
      setCells([])
      return
    }
    setLocationLoading(true)
    getCells(sectorId)
      .then((items) => {
        setCells(items)
        setLocationError('')
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false))
    setCellId('')
    setVillages([])
  }, [locationHydrated, sectorId])

  useEffect(() => {
    if (locationHydrated) return
    if (!cellId) {
      setVillages([])
      return
    }
    setLocationLoading(true)
    getVillages(cellId)
      .then((items) => {
        setVillages(items)
        setLocationError('')
      })
      .catch((error) => setLocationError(normalizeApiError(error).message))
      .finally(() => setLocationLoading(false))
  }, [cellId, locationHydrated])

  async function trackApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const applicationCode = String(new FormData(event.currentTarget).get('applicationCode')).trim()
    if (!applicationCode) return

    setTracking(true)
    setTrackingError('')
    try {
      const response = await trackShopApplication(applicationCode)
      const record: ApplicationRecord = {
        ...response,
        applicantEmail: account.email || undefined,
        submittedAt: response.history[0]?.createdAt || new Date().toISOString(),
      }
      setApplication(record)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setTrackingError(normalizeApiError(error).message)
    } finally {
      setTracking(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidFields = findInvalidFields(event.currentTarget)
    if (invalidFields.length) {
      setValidationErrors(Object.fromEntries(invalidFields.map((field) => [field.name, fieldValidationMessage(field)])))
      setSubmissionError('')
      invalidFields[0].focus()
      return
    }
    const data = new FormData(event.currentTarget)
    const registrationDocument = data.get('rbdRegistrationDocument')
    const logo = data.get('logo')
    if (
      (!(registrationDocument instanceof File) || !registrationDocument.size)
      && !renewalApplication?.shop.rbdRegistrationDocument
    ) {
      setSubmissionError('Please attach the RDB registration document.')
      return
    }
    const applicantEmail = String(data.get('applicantEmail')).trim()
    const applicantName = String(data.get('applicantName')).trim()
    const payload: ShopApplicationPayload = {
      applicantEmail,
      applicantName,
      name: String(data.get('shopName')).trim(),
      email: String(data.get('shopEmail')).trim(),
      phone: String(data.get('phone')).trim(),
      representativePhone: String(data.get('representativePhone')).trim(),
      description: String(data.get('description')).trim(),
      villageId: String(data.get('villageId')),
      street: String(data.get('street')).trim(),
      googleMapsLocationLink: String(data.get('googleMapsLocationLink')).trim() || undefined,
      tinNumber: String(data.get('tinNumber')).trim(),
      rbdRegistrationDocument: registrationDocument instanceof File && registrationDocument.size ? registrationDocument : undefined,
      logo: logo instanceof File && logo.size ? logo : undefined,
    }
    setSubmitting(true)
    setValidationErrors({})
    setSubmissionError('')
    setSubmissionSuccess('')
    try {
      await (renewalApplication
        ? renewShopApplication(renewalApplication.applicationCode, payload)
        : submitShopApplication(payload))
      setRenewalApplication(null)
      setApplication(null)
      setProvinceId('')
      setDistrictId('')
      setSectorId('')
      setCellId('')
      setVillageId('')
      setDistricts([])
      setSectors([])
      setCells([])
      setVillages([])
      setLocationHydrated(false)
      setFormVersion((current) => current + 1)
      setSubmissionSuccess('Your request has been sent successfully.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmissionError(formatSellerApplicationError(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function editReturnedApplication(returnedApplication: ApplicationRecord) {
    const savedVillage = returnedApplication.shop.village
    const savedSector = savedVillage?.sector
    const savedDistrict = savedSector?.district
    const savedProvince = savedDistrict?.province
    const savedCell = savedVillage?.cell
    if (savedProvince && savedDistrict && savedSector && savedCell && savedVillage) {
      setProvinces([toLocationOption(savedProvince)])
      setDistricts([toLocationOption(savedDistrict)])
      setSectors([toLocationOption(savedSector)])
      setCells([toLocationOption(savedCell)])
      setVillages([toLocationOption(savedVillage)])
      setProvinceId(savedProvince.id)
      setDistrictId(savedDistrict.id)
      setSectorId(savedSector.id)
      setCellId(savedCell.id)
      setVillageId(savedVillage.id)
      setLocationHydrated(true)
    }
    setRenewalApplication(returnedApplication)
    setApplication(null)
    setSubmissionError('')
    setLocationLoading(true)
    setLocationError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const tree = await getLocationTree()
      const savedVillageId = returnedApplication.shop.village?.id
      const path = savedVillageId ? findLocationPath(tree, savedVillageId) : undefined
      if (path) {
        setProvinces(tree.map(toLocationOption))
        setDistricts(path.province.districts.map(toLocationOption))
        setSectors(path.district.sectors.map(toLocationOption))
        setCells(path.sector.cells.map(toLocationOption))
        setVillages(path.cell.villages)
        setProvinceId(path.province.id)
        setDistrictId(path.district.id)
        setSectorId(path.sector.id)
        setCellId(path.cell.id)
        setVillageId(path.village.id)
        setLocationHydrated(true)
      } else {
        setLocationHydrated(false)
        setLocationError('The saved village could not be found in the current SOVA location tree. Please select the shop location again.')
      }
    } catch (error) {
      setLocationHydrated(false)
      setLocationError(normalizeApiError(error).message)
    } finally {
      setLocationLoading(false)
    }
  }

  const renewalShop = renewalApplication?.shop
  const returnMessage = renewalApplication ? applicationFeedback(renewalApplication) : undefined
  const prefilledAccount = formVersion === 0 && !renewalApplication ? account : { email: '', name: '' }

  return (
    <main className="min-h-[75vh]">
      <section className="border-b border-line bg-soft/60">
        <div className="page-container py-8 sm:py-12">
          <button className="inline-flex items-center gap-2 text-xs font-bold text-cream transition hover:text-primary-dark" onClick={onBack} type="button">
            <ChevronLeft size={16} /> Back to shopping
          </button>
          <div className="mt-7">
            <h1 className="auth-eyebrow text-2xl">Sell on SOVA</h1>
            <p className="mt-2 text-sm text-cream">{renewalApplication ? 'Correct the requested details and resubmit for review' : 'Complete one application to open your shop on the marketplace'}</p>
          </div>
        </div>
      </section>

      <section className="page-container py-10 sm:py-14">
        <section className="mb-6 w-full rounded-3xl border border-line bg-white p-5 sm:p-6">
          <FormHeading icon={<Search size={18} />} title="Track your seller application" copy="Enter the application code you received after submitting to view its progress and feedback." />
          <form className="mt-4 flex flex-col items-end gap-3 sm:flex-row" onSubmit={trackApplication}>
            <label className="w-full flex-1">
              <span className="text-xs font-bold text-ink">Application code<span className="ml-1 text-red-600" aria-hidden="true">*</span></span>
              <span className="seller-input">
                <input name="applicationCode" placeholder="Enter application code" required />
              </span>
            </label>
            <button className="primary-button justify-center sm:min-w-32" disabled={tracking} type="submit">
              {tracking ? <><LoaderCircle className="animate-spin" size={15} /> Tracking…</> : 'Track'}
            </button>
          </form>
          {trackingError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{trackingError}</p>}
        </section>

        <ValidationErrorsContext.Provider value={validationErrors}>
          {submissionSuccess && (
            <p className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700" role="status">
              {submissionSuccess}
            </p>
          )}
          <form
            className="w-full rounded-3xl border border-line bg-white p-6 sm:p-8"
            key={`${renewalApplication?.applicationCode || 'new-application'}-${formVersion}`}
            noValidate
            onInput={(event) => {
              const fieldName = (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).name
              if (fieldName) {
                setValidationErrors((current) => {
                  if (!current[fieldName]) return current
                  const next = { ...current }
                  delete next[fieldName]
                  return next
                })
              }
              setSubmissionError('')
              setSubmissionSuccess('')
            }}
            onSubmit={submit}
          >
            {returnMessage && (
              <div className="mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <strong className="block">Changes requested by SOVA</strong>
                <p className="mt-2 leading-6">{returnMessage}</p>
              </div>
            )}
            <div>
              <FormHeading icon={<Building2 size={20} />} title="Tell us about your shop" copy="Start your application directly. If you are signed in, your saved contact details are filled in for you." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Shop name"><input defaultValue={renewalShop?.name} maxLength={120} minLength={2} name="shopName" placeholder="Example: Kigali Home Studio" required /></FormField>
                <FormField label="Shop email"><input defaultValue={renewalShop?.email || ''} name="shopEmail" placeholder="shop@example.com" required type="email" /></FormField>
                <FormField label="Shop phone"><input defaultValue={renewalShop?.phone || ''} inputMode="numeric" maxLength={10} name="phone" pattern="07(8|9|3|2)[0-9]{7}" placeholder="0781234567" required title="Use 10 digits starting with 078, 079, 073, or 072." type="tel" /></FormField>
                <FormField className="sm:col-span-2 lg:col-span-3" label="Shop description">
                  <textarea className="min-h-28 resize-y" defaultValue={renewalShop?.description || ''} maxLength={2000} minLength={20} name="description" placeholder="Describe what you sell, where products come from, and what makes your shop trustworthy." required />
                </FormField>
                <div className="mt-2 border-t border-line pt-5 sm:col-span-2 lg:col-span-3">
                  <h3 className="text-sm font-black text-ink">Representative details</h3>
                  <p className="mt-1 text-xs text-muted">The person SOVA should contact about this application.</p>
                </div>
                <FormField label="Representative name">
                  <input defaultValue={renewalShop?.representativeNames || prefilledAccount.name} maxLength={120} minLength={2} name="applicantName" placeholder="Full name" readOnly={Boolean(prefilledAccount.name)} required />
                </FormField>
                <FormField label="Representative email">
                  <input defaultValue={renewalShop?.representativeEmail || prefilledAccount.email} name="applicantEmail" placeholder="you@example.com" readOnly={Boolean(prefilledAccount.email)} required type="email" />
                </FormField>
                <FormField label="Representative phone">
                  <input defaultValue={renewalShop?.representativePhone || ''} inputMode="numeric" maxLength={10} name="representativePhone" pattern="07(8|9|3|2)[0-9]{7}" placeholder="0781234567" required title="Use 10 digits starting with 078, 079, 073, or 072." type="tel" />
                </FormField>
              </div>
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <FormHeading icon={<MapPin size={20} />} title="Where is the shop located?" copy="Province, district, sector, cell, and village options come directly from the SOVA public location API." />
              {locationError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{locationError}</p>}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Province">
                  <select name="provinceId" onChange={(event) => {
                    setLocationHydrated(false)
                    setProvinceId(event.target.value)
                    setDistrictId('')
                    setSectorId('')
                    setCellId('')
                    setVillageId('')
                  }} required value={provinceId}>
                    <option value="">Select province</option>{provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </FormField>
                <FormField label="District">
                  <select disabled={!provinceId} name="districtId" onChange={(event) => {
                    setLocationHydrated(false)
                    setDistrictId(event.target.value)
                    setSectorId('')
                    setCellId('')
                    setVillageId('')
                  }} required value={districtId}>
                    <option value="">Select district</option>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Sector">
                  <select disabled={!districtId} name="sectorId" onChange={(event) => {
                    setLocationHydrated(false)
                    setSectorId(event.target.value)
                    setCellId('')
                    setVillageId('')
                  }} required value={sectorId}>
                    <option value="">Select sector</option>{sectors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Cell">
                  <select disabled={!sectorId} name="cellId" onChange={(event) => {
                    setLocationHydrated(false)
                    setCellId(event.target.value)
                    setVillageId('')
                  }} required value={cellId}>
                    <option value="">Select cell</option>{cells.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Village">
                  <select disabled={!cellId} name="villageId" onChange={(event) => setVillageId(event.target.value)} required value={villageId}><option value="">Select village</option>{villages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                </FormField>
                <FormField label="Street or building"><input defaultValue={renewalShop?.street || ''} name="street" placeholder="Street, building, or landmark" required /></FormField>
                <FormField className="sm:col-span-2 lg:col-span-3" label="Google Maps link (optional)"><input defaultValue={renewalShop?.googleMapsLocationLink || ''} name="googleMapsLocationLink" placeholder="https://maps.google.com/..." type="url" /></FormField>
              </div>
              {locationLoading && <p className="mt-4 flex items-center gap-2 text-xs text-muted"><LoaderCircle className="animate-spin" size={14} /> Loading location information…</p>}
            </div>

            <div className="mt-10 border-t border-line pt-8">
              <FormHeading icon={<FileCheck2 size={20} />} title="Business verification" copy="Provide the registration information SOVA needs to review your application." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField className="sm:col-span-2 lg:col-span-3" label="TIN number"><input defaultValue={renewalShop?.tinNumber || ''} inputMode="numeric" maxLength={9} name="tinNumber" pattern="[0-9]{9}" placeholder="Enter 9-digit TIN" required title="TIN number must contain exactly 9 digits and numbers only." /></FormField>
                <UploadField accept=".pdf,image/png,image/jpeg" existingUrl={renewalShop?.rbdRegistrationDocument} label="RDB registration document" name="rbdRegistrationDocument" />
                <UploadField accept="image/png,image/jpeg,image/webp" existingUrl={renewalShop?.logo} label="Shop logo (optional)" name="logo" required={false} />
              </div>
              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-soft p-4 text-xs leading-5 text-muted">
                  <input className="auth-checkbox mt-0.5" name="informationConfirmed" required type="checkbox" />
                  <span>I confirm that this information is accurate and authorize SOVA to review the business details before approving the shop.<span className="ml-1 text-red-600" aria-hidden="true">*</span></span>
                </label>
                {validationErrors.informationConfirmed && <p className="text-xs font-semibold text-red-600" role="alert">{validationErrors.informationConfirmed}</p>}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-soft p-4 text-xs leading-5 text-muted">
                  <input className="auth-checkbox mt-0.5" name="termsAccepted" required type="checkbox" />
                  <span>I have read and agree to the <a className="font-bold text-ink underline underline-offset-2 transition hover:text-primary-dark" href="#terms">SOVA terms and conditions</a>.<span className="ml-1 text-red-600" aria-hidden="true">*</span></span>
                </label>
                {validationErrors.termsAccepted && <p className="text-xs font-semibold text-red-600" role="alert">{validationErrors.termsAccepted}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-line pt-5">
              <button className="primary-button min-w-40 justify-center" disabled={submitting} type="submit">
                {submitting ? <><LoaderCircle className="animate-spin" size={15} /> Submitting…</> : renewalApplication ? 'Resubmit application' : 'Submit application'}
              </button>
            </div>
            {submissionError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700" role="alert">{submissionError}</p>}
          </form>
        </ValidationErrorsContext.Provider>
      </section>
      {application && (
        <ApplicationStatus
          application={application}
          onClose={() => setApplication(null)}
          onEdit={() => void editReturnedApplication(application)}
        />
      )}
    </main>
  )
}

function ApplicationStatus({ application, onClose, onEdit }: { application: ApplicationRecord; onClose: () => void; onEdit: () => void }) {
  const title = application.status === 'active'
    ? 'Your shop application was approved'
    : application.status === 'rejected'
      ? 'Your shop application was not approved'
      : application.status === 'returned'
        ? 'Your application needs changes'
        : application.status === 'under review'
          ? 'Your application is under review'
          : 'Your shop is awaiting review'
  const feedback = applicationFeedback(application)
  const canEdit = Boolean(feedback && application.canRenew)
  const shop = application.shop

  return (
    <div aria-labelledby="application-progress-title" aria-modal="true" className="fixed inset-0 z-[90] overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:p-8" role="dialog">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-3xl border border-line bg-white p-7 sm:p-10">
          <button aria-label="Close application progress" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-soft text-muted transition hover:bg-line hover:text-ink" onClick={onClose} type="button"><X size={17} /></button>
          <span className="grid size-14 place-items-center rounded-full bg-primary-light text-primary-dark"><Clock3 size={25} /></span>
          <p className="mt-6 auth-eyebrow">Application progress</p>
          <h1 className="mt-2 pr-10 text-3xl font-black tracking-[-0.04em] text-ink" id="application-progress-title">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {application.applicantEmail
              ? <>The SOVA team will send approval or feedback to <strong className="text-ink">{application.applicantEmail}</strong>.</>
              : 'The latest progress returned by the SOVA application service is shown below.'}
          </p>
          <div className="mt-7 grid gap-3 rounded-2xl bg-soft p-5 sm:grid-cols-2">
            <StatusDetail label="Application code" value={application.applicationCode} />
            <StatusDetail label="Shop" value={application.shopName} />
            <StatusDetail label="Submitted" value={new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(application.submittedAt))} />
            <StatusDetail label="Status" value={application.status.toUpperCase()} />
          </div>
          <section className="mt-8 border-t border-line pt-7">
            <h2 className="text-lg font-black text-ink">Submitted application details</h2>
            <div className="mt-4 grid gap-4 rounded-2xl bg-soft p-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatusDetail label="Shop name" value={shop.name} />
              <StatusDetail label="Shop email" value={shop.email || 'Not provided'} />
              <StatusDetail label="Shop phone" value={shop.phone || 'Not provided'} />
              <div className="sm:col-span-2">
                <StatusDetail label="Shop description" value={shop.description || 'Not provided'} />
              </div>
              <StatusDetail label="Representative" value={shop.representativeNames || 'Not provided'} />
              <StatusDetail label="Representative email" value={shop.representativeEmail || 'Not provided'} />
              <StatusDetail label="Representative phone" value={shop.representativePhone || 'Not provided'} />
              <StatusDetail label="Province" value={shop.village?.sector?.district?.province?.name || 'Not provided'} />
              <StatusDetail label="District" value={shop.village?.sector?.district?.name || 'Not provided'} />
              <StatusDetail label="Sector" value={shop.village?.sector?.name || 'Not provided'} />
              <StatusDetail label="Cell" value={shop.village?.cell?.name || 'Not provided'} />
              <StatusDetail label="Village" value={shop.village?.name || 'Not provided'} />
              <StatusDetail label="Street" value={shop.street || 'Not provided'} />
              <StatusDetail label="TIN number" value={shop.tinNumber || 'Not provided'} />
              <ApplicationLinkDetail label="Google Maps location" linkText={shop.googleMapsLocationLink || undefined} rawUrl url={shop.googleMapsLocationLink} />
              <ApplicationLinkDetail label="RDB registration document" linkText="Open RDB document" url={shop.rbdRegistrationDocument} />
              <ApplicationLinkDetail label="Shop logo" linkText="Open shop logo" url={shop.logo} />
            </div>
          </section>
          <FeedbackPanel application={application} />
          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <button className="secondary-button" onClick={onClose} type="button">Close</button>
            {canEdit && <button className="primary-button" onClick={onEdit} type="button"><Edit3 size={15} /> Edit requested details</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormHeading({ copy, icon, title }: { copy: string; icon: React.ReactNode; title: string }) {
  return <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark">{icon}</span><div><h2 className="text-xl font-black text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{copy}</p></div></div>
}

function FormField({ children, className = '', label }: { children: React.ReactNode; className?: string; label: string }) {
  const errors = useContext(ValidationErrorsContext)
  const field = isValidElement<{ name?: string; required?: boolean }>(children) ? children : undefined
  const error = field?.props.name ? errors[field.props.name] : undefined
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold text-ink">{label}{field?.props.required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}</span>
      <span className={`seller-input ${error ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-100' : ''}`}>{children}</span>
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600" role="alert">{error}</span>}
    </label>
  )
}

function UploadField({ accept, existingUrl, label, name, required = true }: { accept: string; existingUrl?: string | null; label: string; name: string; required?: boolean }) {
  const errors = useContext(ValidationErrorsContext)
  const validationError = errors[name]
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [fileError, setFileError] = useState('')
  const [existingFileVisible, setExistingFileVisible] = useState(Boolean(existingUrl))
  const replacementRequired = existingUrl ? !existingFileVisible : required
  const uploadInputId = `${name}-upload`
  const existingFileName = existingUrl ? fileNameFromUrl(existingUrl) : ''

  return (
    <div className="block">
      <span className="text-xs font-bold text-ink">{label}{replacementRequired && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}</span>
      <div className={`relative mt-2 flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed bg-soft px-3 text-center text-xs transition ${fileError || validationError ? 'border-red-300 text-red-700' : fileName ? 'border-green-300 text-green-700' : 'border-ink/20 text-muted hover:border-primary'}`}>
        {existingUrl && existingFileVisible ? (
          <>
            <button
              aria-label={`Remove previously submitted ${label}`}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
              onClick={() => setExistingFileVisible(false)}
              title="Remove old file and choose a replacement"
              type="button"
            >
              <X size={14} />
            </button>
            <CheckCircle2 className="mb-2 text-green-700" size={19} />
            <a className="max-w-[85%] truncate font-bold text-primary-dark underline underline-offset-2" href={sellerResourceUrl(existingUrl)} rel="noreferrer" target="_blank" title={existingFileName}>
              {existingFileName}
            </a>
            <label className="mt-2 cursor-pointer text-[10px] font-bold text-muted underline underline-offset-2" htmlFor={uploadInputId}>Choose a replacement</label>
          </>
        ) : (
          <label className="flex size-full min-h-24 cursor-pointer flex-col items-center justify-center" htmlFor={uploadInputId}>
            {fileName ? <CheckCircle2 className="mb-2" size={19} /> : <Upload className="mb-2 text-primary-dark" size={18} />}
            <strong className="max-w-full truncate">{fileName || 'Choose a file'}</strong>
            <span className="mt-1 text-[10px] opacity-70">{fileError || fileSize || (replacementRequired ? 'Required • maximum 5 MB' : 'Optional • maximum 5 MB')}</span>
          </label>
        )}
        <input
          accept={accept}
          className="sr-only"
          id={uploadInputId}
          name={name}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) {
              setFileName('')
              setFileSize('')
              setFileError('')
              setExistingFileVisible(Boolean(existingUrl))
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
            setExistingFileVisible(false)
            event.target.setCustomValidity('')
          }}
          required={replacementRequired}
          type="file"
        />
      </div>
      {validationError && <span className="mt-1.5 block text-xs font-semibold text-red-600" role="alert">{validationError}</span>}
    </div>
  )
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span><strong className="mt-1 block text-sm text-ink">{value}</strong></div>
}

function ApplicationLinkDetail({ label, linkText, rawUrl = false, url }: { label: string; linkText: string | undefined; rawUrl?: boolean; url?: string | null }) {
  const href = url ? (rawUrl ? url : sellerResourceUrl(url)) : undefined
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{label}</span>
      {href
        ? <a className="mt-1 inline-block break-all text-sm font-bold text-primary-dark underline underline-offset-2" href={href} rel="noreferrer" target="_blank">{linkText}</a>
        : <strong className="mt-1 block text-sm text-ink">Not provided</strong>}
    </div>
  )
}

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url, window.location.origin).pathname
    return decodeURIComponent(path.split('/').filter(Boolean).pop() || 'Previously submitted file')
  } catch {
    return url.split('/').filter(Boolean).pop()?.split('?')[0] || 'Previously submitted file'
  }
}

function FeedbackPanel({ application }: { application: ApplicationRecord }) {
  const feedback = applicationFeedback(application)
  return (
    <div className={`mt-8 rounded-xl border p-4 text-xs leading-5 ${feedback ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
      <strong className="block">{feedback ? 'Message from the SOVA review team' : 'Feedback will appear here'}</strong>
      {feedback || 'If the review team requests a correction, this page will show their message and renewal instructions.'}
    </div>
  )
}

function applicationFeedback(application: ApplicationRecord) {
  return [...application.history].reverse().find((item) => item.applicantMessage)?.applicantMessage || undefined
}

function loadAccount() {
  try {
    const account = JSON.parse(localStorage.getItem('sova-account-settings') || '{}')
    return { name: account.name || '', email: account.email || '' }
  } catch {
    return { name: '', email: '' }
  }
}

function toLocationOption(location: { id: string; name: string }): LocationOption {
  return { id: location.id, name: location.name }
}

function findLocationPath(tree: LocationTreeProvince[], villageId: string) {
  for (const province of tree) {
    for (const district of province.districts) {
      for (const sector of district.sectors) {
        for (const cell of sector.cells) {
          const village = cell.villages.find((item) => item.id === villageId)
          if (village) return { cell, district, province, sector, village }
        }
      }
    }
  }
  return undefined
}

const fieldLabels: Record<string, string> = {
  applicantEmail: 'Representative email',
  applicantName: 'Representative name',
  cellId: 'Cell',
  description: 'Shop description',
  informationConfirmed: 'Information confirmation',
  phone: 'Shop phone',
  provinceId: 'Province',
  rbdRegistrationDocument: 'RDB registration document',
  representativePhone: 'Representative phone',
  sectorId: 'Sector',
  shopEmail: 'Shop email',
  shopName: 'Shop name',
  street: 'Street or building',
  termsAccepted: 'SOVA terms and conditions agreement',
  tinNumber: 'TIN number',
  villageId: 'Village',
}

function findInvalidFields(form: HTMLFormElement) {
  const fields = Array.from(form.elements).filter(
    (element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      element instanceof HTMLInputElement
      || element instanceof HTMLSelectElement
      || element instanceof HTMLTextAreaElement,
  )
  return fields.filter((field) => !field.disabled && !field.validity.valid)
}

function fieldValidationMessage(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const label = fieldLabels[field.name] || 'This field'
  if (field.validity.valueMissing) return `${label} is required.`
  if (field.validity.typeMismatch) return `${label} is not valid. Please enter a correctly formatted value.`
  if (field.validity.patternMismatch) return field.title || `${label} has an invalid format. Please correct it.`
  if (field.validity.tooShort && 'minLength' in field) return `${label} must contain at least ${field.minLength} characters.`
  if (field.validity.tooLong && 'maxLength' in field) return `${label} must contain no more than ${field.maxLength} characters.`
  if (field.validity.customError) return field.validationMessage
  return `${label} is invalid. Please correct it before submitting.`
}
