export interface LocationOption {
  id: string
  name: string
}

export interface ShopApplicationPayload {
  applicantEmail: string
  applicantName: string
  description: string
  email: string
  googleMapsLocationLink?: string
  logo?: File
  name: string
  phone: string
  rbdRegistrationDocument: File
  street: string
  tinNumber: string
  villageId: string
}

export interface SellerApplicationResponse {
  applicationCode: string
  canRenew: boolean
  history: Array<{
    applicantMessage?: string | null
    createdAt: string
    note: string
    status: string
  }>
  shopName: string
  status: 'submitted' | 'resubmitted' | 'under review' | 'returned' | 'active' | 'suspended' | 'rejected'
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://137.184.42.115:7090').replace(/\/$/, '')
const locationPath = '/seller/shop-applications/locations'

export function getProvinces() {
  return getLocations('provinces', 'root')
}

export function getDistricts(provinceId: string) {
  return getLocations('districts', provinceId)
}

export function getSectors(districtId: string) {
  return getLocations('sectors', districtId)
}

export function getCells(sectorId: string) {
  return getLocations('cells', sectorId)
}

export function getVillages(cellId: string) {
  return getLocations('villages', cellId)
}

export async function submitShopApplication(payload: ShopApplicationPayload) {
  const data = new FormData()
  data.set('name', payload.name)
  data.set('description', payload.description)
  data.set('email', payload.email)
  data.set('phone', payload.phone)
  data.set('street', payload.street)
  data.set('villageId', payload.villageId)
  data.set('tinNumber', payload.tinNumber)
  data.set('representativeEmail', payload.applicantEmail)
  data.set('representativePhone', payload.phone)
  data.set('representativeNames', payload.applicantName)
  data.set('rbdRegistrationDocument', payload.rbdRegistrationDocument)
  if (payload.googleMapsLocationLink) data.set('googleMapsLocationLink', payload.googleMapsLocationLink)
  if (payload.logo) data.set('logo', payload.logo)

  const response = await fetch(`${apiBaseUrl}/seller/shop-applications`, { method: 'POST', body: data })
  return unwrapResponse<SellerApplicationResponse>(response)
}

export async function trackShopApplication(applicationCode: string) {
  const response = await fetch(`${apiBaseUrl}/seller/shop-applications/${encodeURIComponent(applicationCode)}`)
  return unwrapResponse<SellerApplicationResponse>(response)
}

async function getLocations(level: string, parentId: string) {
  const response = await fetch(`${apiBaseUrl}${locationPath}/${level}?parentId=${encodeURIComponent(parentId)}`)
  return unwrapResponse<LocationOption[]>(response)
}

async function unwrapResponse<Result>(response: Response): Promise<Result> {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.message
    if (response.status >= 500) {
      throw new Error('The SOVA server could not store the uploaded file. Please try a smaller PDF or image; if it continues, the backend upload storage needs attention.')
    }
    throw new Error(Array.isArray(message) ? message.join(' ') : message || 'The SOVA service could not complete this request.')
  }
  return (body?.data ?? body) as Result
}
