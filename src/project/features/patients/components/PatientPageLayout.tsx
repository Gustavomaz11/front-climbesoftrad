import type { ReactNode } from 'react'
import { PageHeading } from '@/portal/PageHeading'
export const PatientPageLayout = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-7 lg:p-8"><PageHeading eyebrow="Pacientes" title={title} description={description} />{children}</main>
