import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { ExamIdentityFields } from './ExamIdentityFields'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { createExam } from '../exams-api'
import type { CreateExamPayload } from '../exam.types'
import { useHospitalUnits } from '../../hospital-units/useHospitalUnits'
import { ExamPatientFields } from './ExamPatientFields'
import { ExamSchedulingFields } from './ExamSchedulingFields'
import { ExamStudyFields } from './ExamStudyFields'
import { examFormSchema, initialExamFormValues, type ExamFormValues } from './exam-form'

interface CreateExamModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const emptyToUndefined = (value: string) => value.trim() || undefined

export const CreateExamModal = ({ open, onClose, onCreated }: CreateExamModalProps) => {
  const [sourceExamId, setSourceExamId] = useState(() => crypto.randomUUID())
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { units, loading: unitsLoading, error: unitsError } = useHospitalUnits()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: initialExamFormValues(),
  })

  const close = () => {
    if (isSubmitting) return
    setSubmitError(null)
    reset(initialExamFormValues())
    setSourceExamId(crypto.randomUUID())
    onClose()
  }

  const onSubmit = async (values: ExamFormValues) => {
    setSubmitError(null)
    if (
      (values.externalPatientId || values.externalEncounterId) &&
      values.originIssuer.trim().length < 2
    ) {
      setSubmitError('Informe o sistema emissor dos identificadores.')
      return
    }
    const payload: CreateExamPayload = {
      sourceExamId,
      originIssuer: values.originIssuer || 'SOURAD_MANUAL',
      patientId: values.patientId || undefined,
      externalPatientId: values.externalPatientId || undefined,
      externalEncounterId: values.externalEncounterId || undefined,
      examTypeId: values.examTypeId || undefined,
      patientName: values.patientName,
      socialName: emptyToUndefined(values.socialName),
      sex: values.sex,
      birthDate: values.birthDate,
      identity: emptyToUndefined(values.identity),
      country: values.country,
      email: emptyToUndefined(values.email),
      studyDescription: values.studyDescription,
      code: emptyToUndefined(values.code),
      accessionNumber: emptyToUndefined(values.accessionNumber),
      orderCode: emptyToUndefined(values.orderCode),
      modality: values.modality,
      unitId: values.unitId,
      priority: values.priority,
      requesterReference: emptyToUndefined(values.requesterReference),
      requesterName: emptyToUndefined(values.requesterName),
      performingPhysician: emptyToUndefined(values.performingPhysician),
      healthInsurance: emptyToUndefined(values.healthInsurance),
      performedAt: new Date(`${values.performedDate}T${values.performedTime}:00`).toISOString(),
      auxiliaryField1: emptyToUndefined(values.auxiliaryField1),
      auxiliaryField2: emptyToUndefined(values.auxiliaryField2),
    }

    try {
      await createExam(payload)
      reset(initialExamFormValues())
      setSourceExamId(crypto.randomUUID())
      onCreated()
      onClose()
    } catch {
      setSubmitError('Não foi possível cadastrar o exame. Verifique os dados e tente novamente.')
    }
  }

  return (
    <Modal
      open={open}
      title="Adicionar exame"
      description="Cadastre o paciente e as informações do estudo realizado."
      size="xl"
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-exam-form"
            loading={isSubmitting}
            loadingText="Salvando..."
            leftIcon={<Save size={17} />}
          >
            Salvar exame
          </Button>
        </>
      }
    >
      <form
        id="create-exam-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}
        <ExamPatientFields register={register} errors={errors} />
        <ExamStudyFields
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          control={control}
          units={units}
          unitsLoading={unitsLoading}
          unitsError={unitsError}
        />
        <ExamIdentityFields register={register} watch={watch} setValue={setValue} />
        <ExamSchedulingFields register={register} errors={errors} />
      </form>
    </Modal>
  )
}
