import { z } from 'zod'
import { examPriorities } from '../exam.types'

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Máximo de ${maximum} caracteres.`)

export const examFormSchema = z
  .object({
    patientId: z.union([z.literal(''), z.string().uuid()]),
    originIssuer: optionalText(120),
    externalPatientId: z.string().max(120),
    externalEncounterId: z.string().max(120),
    examTypeId: z.union([z.literal(''), z.string().uuid()]),
    patientName: z.string().trim().min(2, 'Informe o nome do paciente.').max(120),
    socialName: optionalText(120),
    sex: z.enum(['MASCULINO', 'FEMININO']),
    birthDate: z.string().min(1, 'Informe a data de nascimento.'),
    identity: optionalText(80),
    country: z.string().trim().min(2, 'Informe o país.').max(80),
    email: z.union([z.literal(''), z.email('Informe um e-mail válido.')]),
    studyDescription: z.string().trim().min(3, 'Informe a descrição do estudo.').max(180),
    code: optionalText(60),
    accessionNumber: optionalText(80),
    orderCode: optionalText(80),
    modality: z.string().regex(/^[A-Z][A-Z0-9_]{0,15}$/, 'Selecione uma modalidade.'),
    unitId: z.string().uuid('Selecione uma unidade.'),
    priority: z.enum(examPriorities),
    requesterReference: optionalText(140),
    requesterName: optionalText(120),
    performingPhysician: optionalText(120),
    healthInsurance: optionalText(100),
    performedDate: z.string().min(1, 'Informe a data do exame.'),
    performedTime: z.string().regex(/^\d{2}:\d{2}$/, 'Informe o horário do exame.'),
    auxiliaryField1: optionalText(160),
    auxiliaryField2: optionalText(160),
  })
  .superRefine((value, ctx) => {
    if ((value.externalPatientId || value.externalEncounterId) && value.originIssuer.length < 2)
      ctx.addIssue({
        code: 'custom',
        path: ['originIssuer'],
        message: 'Informe o sistema emissor dos identificadores.',
      })
    for (const field of ['externalPatientId', 'externalEncounterId'] as const)
      if (value[field] && !value[field].trim())
        ctx.addIssue({ code: 'custom', path: [field], message: 'Informe um identificador válido.' })
  })

export type ExamFormValues = z.infer<typeof examFormSchema>

const localDate = () => {
  const now = new Date()
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 10)
}

const localTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export const initialExamFormValues = (): ExamFormValues => ({
  patientId: '',
  originIssuer: '',
  externalPatientId: '',
  externalEncounterId: '',
  examTypeId: '',
  patientName: '',
  socialName: '',
  sex: 'FEMININO',
  birthDate: '',
  identity: '',
  country: 'Brasil',
  email: '',
  studyDescription: '',
  code: '',
  accessionNumber: '',
  orderCode: '',
  modality: 'MR',
  unitId: '',
  priority: 'ROTINA',
  requesterReference: '',
  requesterName: '',
  performingPhysician: '',
  healthInsurance: '',
  performedDate: localDate(),
  performedTime: localTime(),
  auxiliaryField1: '',
  auxiliaryField2: '',
})
