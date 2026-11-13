import { describe,it,expect } from 'vitest'
import { portalWorkspace } from './portal-workspace'
import type { AuthenticatedUser } from './auth.types'
const central='00000000-0000-4000-8000-000000000001',legacy='00000000-0000-4000-8000-000000000002'
const user=(company=legacy,unit:string|null=null)=>({centralCompanyId:central,companies:[{id:central},{id:legacy}],activeCompany:{id:company,selectedUnitId:unit}} as AuthenticatedUser)
describe('SouRad is the central workspace; hospitals are units',()=>{
  it('replaces a stale hospital-company selection with the central workspace',()=>{
    expect(portalWorkspace(user(),'configuracoes')).toEqual({companyId:central,unitId:null})
    expect(portalWorkspace(user(),'hospital')).toEqual({companyId:central,unitId:null})
  })
  it('opens configuration for all authorized hospitals instead of retaining a unit filter',()=>{
    expect(portalWorkspace(user(central,'hospital-a'),'configuracoes')).toEqual({companyId:central,unitId:null})
  })
  it('preserves the chosen hospital in the hospital and reporting portals',()=>{
    expect(portalWorkspace(user(central,'hospital-a'),'hospital')).toEqual({companyId:central,unitId:'hospital-a'})
  })
  it('does not grant access when the user has no central membership',()=>{
    expect(portalWorkspace({...user(),companies:[]},'configuracoes')).toBeNull()
  })
})
