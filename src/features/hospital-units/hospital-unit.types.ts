export interface HospitalUnit {
  cnpj?: string | null
  legalName?: string | null
  tradeName?: string | null
  internalIdentifier?: string | null
  address?: UnitAddress | null
  contactPhone?: string | null
  contactEmail?: string | null
  router?: { status: 'ONLINE' | 'OFFLINE' | 'NOT_INSTALLED'; installed: number; lastSeenAt: string | null }
  uf?: string | null
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHospitalUnitPayload {
  cnpj?: string
  legalName?: string
  tradeName?: string
  internalIdentifier?: string
  address?: UnitAddress
  contactPhone?: string
  contactEmail?: string
  uf?: string
  name: string
}
export interface UnitAddress { zipCode: string; street: string; number: string; neighborhood: string; city: string }
export type CnpjCompany = Required<Pick<CreateHospitalUnitPayload, 'cnpj' | 'legalName' | 'tradeName' | 'uf' | 'address' | 'contactPhone' | 'contactEmail'>>
