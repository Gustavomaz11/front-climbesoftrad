export const brazilStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as const
export interface RegistryProfile {
  name: string
  registrations: Array<{ crm: string; uf: string; status: string; enabled: boolean }>
  specialties: string[]
  institution: string | null
  graduationYear: string | null
  consultedAt: string
}
export interface RegistryLookupResult extends RegistryProfile { lookupId: string; enabledStates: string[] }
