import { ArrowRight, Building2, Settings2, ShieldCheck, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeading } from './PageHeading'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { portalNavigation } from './portal-navigation'

const descriptions: Record<string, string> = {
  'Médicos': 'Consulte CRM e UF, confira especialidades e defina os hospitais de atendimento.',
  'Unidades e Routers': 'Cadastre hospitais pelo CNPJ, configure o identificador e acompanhe a conexão.',
  'Modalidades': 'Pesquise as modalidades DICOM disponíveis e organize o catélogo.',
  'Catélogo de exames': 'Padronize os tipos de exame e os vínculos com as descrições de origem.',
  'Usuários e vínculos': 'Organize os acessos à central e as unidades autorizadas para cada usuário.',
  'Cargos e permissões': 'Defina as responsabilidades e permissões de cada perfil.',
  'Recepção de imagens': 'Gerencie as fontes DICOM, importações e pendências de recebimento.',
  'Preparação': 'Configure as regras de preparação conforme a rotina de cada hospital.',
  'Protocolos de contraste': 'Gerencie os protocolos utilizados nas prescrições.',
  'Preços de exames': 'Organize as tabelas de preços e os exames associados.',
  'Preferências': 'Personalize as informações e a apresentação dos documentos.',
}
export const ManagementHome = () => {
  const { user } = useAuthentication()
  if (!user) return null
  const items = portalNavigation(user).filter(item => item.to !== '/dashboard')
  return <main className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8"><PageHeading eyebrow="Gestão" title="Uma central bem organizada começa aqui" description="Gerencie os profissionais, hospitais e configurações que conectam toda a operação." />
    <Card className="mb-7 gap-0 border-0 bg-card py-0 text-white ring-0"><CardContent className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8"><div><Badge variant="outline" className="mb-3 border-white/15 bg-card/5 text-[10px] text-muted-foreground">ClimbeSoftRad · Central de laudos</Badge><h2 className="text-xl font-medium tracking-tight">Cada acesso, cada unidade, tudo no lugar.</h2><p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground">Cadastre os médicos da central e os hospitais que enviam exames. As permissões e vínculos acompanham o fluxo do recebimento ao laudo.</p></div><div className="flex gap-3 text-muted-foreground">{[Building2,Stethoscope,ShieldCheck].map((Icon,index) => <span key={index} className="grid size-13 place-items-center rounded-xl border border-white/10 bg-card/5"><Icon className="size-6" strokeWidth={1.4} /></span>)}</div></CardContent></Card>
    <div className="mb-4 flex items-center gap-2"><Settings2 className="size-4 text-primary" /><h2 className="text-sm font-semibold">Cadastros e configurações</h2><Badge variant="secondary" className="ml-auto text-[10px]">{items.length} áreas disponíveis</Badge></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(({ label, icon: Icon, to }) => <Link key={to} to={to} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"><Card className="h-full gap-0 transition-colors group-hover:ring-primary/40"><CardHeader className="gap-3 px-5"><span className="grid size-10 place-items-center rounded-xl bg-primary/5 text-primary"><Icon className="size-5" strokeWidth={1.6} /></span><CardTitle className="text-sm font-semibold">{label}</CardTitle><CardDescription className="min-h-10 text-xs leading-5">{descriptions[label]}</CardDescription></CardHeader><CardContent className="mt-5 flex items-center justify-between px-5 text-[11px] font-medium text-primary">Gerenciar<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></CardContent></Card></Link>)}</div>
  </main>
}
