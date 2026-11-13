import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import type { ExamFormValues } from './exam-form'

interface ExamPatientFieldsProps {
  register: UseFormRegister<ExamFormValues>
  errors: FieldErrors<ExamFormValues>
}

export const ExamPatientFields = ({ register, errors }: ExamPatientFieldsProps) => (
  <fieldset>
    <legend className="mb-4 text-sm font-extrabold text-brand-900">Dados do paciente</legend>
    <div className="grid gap-x-5 gap-y-1 md:grid-cols-2 xl:grid-cols-4">
      <Input {...register('patientName')} label="Paciente *" placeholder="Nome completo" error={errors.patientName?.message} reserveFeedbackSpace containerClassName="md:col-span-2" />
      <Input {...register('socialName')} label="Nome social" placeholder="Se aplicável" error={errors.socialName?.message} reserveFeedbackSpace />
      <Input {...register('identity')} label="Identidade" placeholder="RG ou documento" error={errors.identity?.message} reserveFeedbackSpace />

      <div className="pb-6">
        <span className="mb-2 block text-sm font-semibold text-muted-foreground">Sexo *</span>
        <div className="grid h-12 grid-cols-2 overflow-hidden rounded-xl border border-input">
          {(['MASCULINO', 'FEMININO'] as const).map((sex) => (
            <label key={sex} className="relative grid cursor-pointer place-items-center has-[:checked]:bg-brand-800 has-[:checked]:text-white">
              <input {...register('sex')} type="radio" value={sex} className="sr-only" />
              <span className="text-xs font-bold">{sex === 'MASCULINO' ? 'Masculino' : 'Feminino'}</span>
            </label>
          ))}
        </div>
      </div>
      <Input {...register('birthDate')} type="date" label="Nascimento *" error={errors.birthDate?.message} reserveFeedbackSpace />
      <Input {...register('country')} label="País *" error={errors.country?.message} reserveFeedbackSpace />
      <Input {...register('email')} type="email" label="E-mail" placeholder="paciente@email.com" error={errors.email?.message} reserveFeedbackSpace />
    </div>
  </fieldset>
)
