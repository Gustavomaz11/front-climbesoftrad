import { afterEach,expect,it,vi } from 'vitest'
import { restoreAuthentication } from './authenticate'
import { clearAccessToken } from './auth-http-client'
import { selectRequestWorkspace } from '../companies/company-request-context'
const central='00000000-0000-4000-8000-000000000001',legacy='00000000-0000-4000-8000-000000000002'
afterEach(()=>{vi.unstubAllGlobals();clearAccessToken();selectRequestWorkspace({companyId:null,unitId:null})})
it('shares session restoration so concurrent mounts can recover a retired hospital-company selection',async()=>{
  selectRequestWorkspace({companyId:legacy,unitId:null})
  const user={id:'00000000-0000-4000-8000-000000000003',email:'admin@example.test',username:null,fullName:'Admin',role:'ADMIN',
    allowedPortals:['sourad','hospital','configuracoes'],mustChangePassword:false,isPlatformAdmin:true,centralCompanyId:central,permissions:['physicians.view'],
    accessRole:{id:'',code:'ADMIN',name:'Administrador'},companies:[{allowedPortals:['sourad','hospital','configuracoes'],id:central,name:'SouRad',membershipId:null,allUnits:true,accessRole:{id:'',code:'ADMIN',name:'Administrador'},units:[]}],
    activeCompany:{id:central,name:'SouRad',membershipId:null,allUnits:true,unitIds:[],selectedUnitId:null}}
  const fetch=vi.fn(async(url:string,init:RequestInit)=>{
    await Promise.resolve()
    if(url.endsWith('/auth/token'))return new Response(JSON.stringify({accessToken:'test-token',tokenType:'Bearer',expiresIn:600}))
    if(new Headers(init.headers).get('X-Company-Id')===legacy)return new Response('{}',{status:403})
    return new Response(JSON.stringify(user))
  })
  vi.stubGlobal('fetch',fetch)
  const results=await Promise.all([restoreAuthentication(),restoreAuthentication()])
  expect(results).toEqual([user,user])
  expect(fetch.mock.calls.filter(([url])=>url.endsWith('/auth/me'))).toHaveLength(2)
})
