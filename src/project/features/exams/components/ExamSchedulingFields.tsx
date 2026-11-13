import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import type { ExamFormValues } from './exam-form'

interface ExamSchedulingFieldsProps {
  register: UseFormRegister<ExamFormValues>
  errors: FieldErrors<ExamFormValues>
}

export const ExamSchedulingFields = ({ register, errors }: ExamSchedulingFieldsProps) => (
  <fieldset className="border-t border-border pt-6">
    <legend className="mb-4 text-sm font-extrabold text-brand-900">Solicitação e realização</legend>
    <div className="grid gap-x-5 gap-y-1 md:grid-cols-2 xl:grid-cols-4">
      <Input {...register('requesterReference')} label="E-mail ou CRM do solicitante" placeholder="CRM ou e-mail" error={errors.requesterReference?.message} reserveFeedbackSpace />
      <Input {...register('requesterName')} label="Solicitante manual" placeholder="Nome do solicitante" error={errors.requesterName?.message} reserveFeedbackSpace />
      <Input {...register('performingPhysician')} label="Médico realizante" error={errors.performingPhysician?.message} reserveFeedbackSpace />
      <Input {...register('healthInsurance')} label="Convênio" error={errors.healthInsurance?.message} reserveFeedbackSpace />
      <Input {...register('performedDate')} type="date" label="Data de realização *" error={errors.performedDate?.message} reserveFeedbackSpace />
      <Input {...register('performedTime')} type="time" label="Hora de realização *" error={errors.performedTime?.message} reserveFeedbackSpace />
      <Input {...register('auxiliaryField1')} label="Campo auxiliar 01" error={errors.auxiliaryField1?.message} reserveFeedbackSpace />
      <Input {...register('auxiliaryField2')} label="Campo auxiliar 02" error={errors.auxiliaryField2?.message} reserveFeedbackSpace />
    </div>
  </fieldset>
)
