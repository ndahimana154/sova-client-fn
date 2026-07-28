import { api } from '../api/request'

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

const locationPath = '/seller/shop-applications/locations'

interface ApiEnvelope<T> {
  data: T
  message: string
  status: number
}

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

  return (await api.post<ApiEnvelope<SellerApplicationResponse>, FormData>('/seller/shop-applications', data)).data
}

export async function trackShopApplication(applicationCode: string) {
  return (
    await api.get<ApiEnvelope<SellerApplicationResponse>>(
      `/seller/shop-applications/${encodeURIComponent(applicationCode)}`,
    )
  ).data
}

async function getLocations(level: string, parentId: string) {
  return (
    await api.get<ApiEnvelope<LocationOption[]>>(`${locationPath}/${level}`, {
      params: { parentId },
    })
  ).data
}
