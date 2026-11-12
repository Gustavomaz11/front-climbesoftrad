import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'
import { SearchableSelect } from '../../../components/ui/SearchableSelect'
import type { HospitalUnit } from '../../hospital-units/hospital-unit.types'
import { examPriorities, type ExamPriority } from '../exam.types'
import { ModalitySelect } from '../../exam-modalities/ModalitySelect'
import type { ExamFormValues } from './exam-form'

interface ExamStudyFieldsProps {
  register: UseFormRegister<ExamFormValues>
  errors: FieldErrors<ExamFormValues>
  setValue: UseFormSetValue<ExamFormValues>
  watch: UseFormWatch<ExamFormValues>
  control: Control<ExamFormValues>
  units: HospitalUnit[]
  unitsLoading: boolean
  unitsError: boolean
}

const priorityInitials: Record<ExamPriority, string> = {
  IMEDIATA: 'I', PRIORITARIA: 'P', EMERGENCIA: 'E', URGENTE: 'U', ALTA: 'A', ROTINA: 'R',
}

export const ExamStudyFields = ({ register, errors, setValue, watch, control, units, unitsLoading, unitsError }: ExamStudyFieldsProps) => {
  const selectedModality = watch('modality')
  const selectedPriority = watch('priority')

  return (
    <fieldset className="border-t border-slate-200 pt-6">
      <legend className="mb-4 text-sm font-extrabold text-brand-900">Informações do estudo</legend>
      <div className="grid gap-x-5 gap-y-1 md:grid-cols-2 xl:grid-cols-4">
        <Input {...register('studyDescription')} label="Descrição do estudo *" placeholder="Ex.: RM de joelho direito" error={errors.studyDescription?.message} reserveFeedbackSpace containerClassName="md:col-span-2" />
        <Input {...register('code')} label="Código" error={errors.code?.message} reserveFeedbackSpace />
        <Input {...register('accessionNumber')} label="Accession Number" error={errors.accessionNumber?.message} reserveFeedbackSpace />
        <Input {...register('orderCode')} label="Código do pedido" error={errors.orderCode?.message} reserveFeedbackSpace />
        <div className="pb-6 md:col-span-2">
          <Controller
            name="unitId"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Unidade *"
                options={units.map((unit) => ({ id: unit.id, label: unit.name }))}
                value={field.value}
                onChange={field.onChange}
                placeholder="Digite para filtrar as unidades"
                loading={unitsLoading}
                emptyMessage="Nenhuma unidade cadastrada."
                error={errors.unitId?.message ?? (unitsError ? 'Não foi possível carregar as unidades.' : undefined)}
              />
            )}
          />
          {!unitsLoading && !unitsError && units.length === 0 ? <p className="mt-1.5 text-xs text-amber-700">Cadastre uma unidade em Gestão &gt; Unidades antes de salvar o exame.</p> : null}
        </div>

        <div className="pb-6 md:col-span-2 xl:col-span-4">
          <input {...register('modality')} type="hidden" />
          <ModalitySelect label="Modalidade *" value={selectedModality} onChange={value=>setValue('modality',value,{shouldValidate:true})} error={errors.modality?.message} />
        </div>

        <div className="pb-6 md:col-span-2 xl:col-span-4">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Prioridade *</span>
          <input {...register('priority')} type="hidden" />
          <div className="flex flex-wrap gap-2">
            {examPriorities.map((priority) => (
              <button key={priority} type="button" title={priority.toLocaleLowerCase('pt-BR')} aria-pressed={selectedPriority === priority} onClick={() => setValue('priority', priority, { shouldValidate: true })} className={`grid size-11 place-items-center rounded-full border-2 text-sm font-extrabold transition ${selectedPriority === priority ? 'border-red-400 bg-brand-950 text-white' : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-brand-300'}`}>{priorityInitials[priority]}</button>
            ))}
          </div>
        </div>
      </div>
    </fieldset>
  )
}
