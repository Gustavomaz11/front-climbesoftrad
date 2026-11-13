import type { ReactNode } from 'react'
import { PageHeading } from '@/portal/PageHeading'
import type { SettingsSection } from '../settings-section'
export const SettingsPageLayout = ({ title, description, children }: { active: SettingsSection; title: string; description: string; children: ReactNode }) => <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-7 lg:p-8"><PageHeading eyebrow="Gestão" title={title} description={description} />{children}</main>
