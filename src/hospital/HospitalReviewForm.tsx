import { useState, type FormEvent } from 'react'
import { Send, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { examPriorities } from '../features/exams/exam.types'
import { ModalitySelect } from '../features/exam-modalities/ModalitySelect'
import { intakeError, saveHospitalIntake, type HospitalIntake } from './hospital-api'
import { HospitalDicomPreview } from './HospitalDicomPreview'
import { initialHospitalFields, reviewedHospitalFields } from './hospital-review-fields'
const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-cyan-600 focus:outline-cyan-600 disabled:bg-slate-50'

export const HospitalReviewForm = ({ intake, canSubmit, onClose, onDone }: {
  intake: HospitalIntake; canSubmit: boolean; onClose: () => void; onDone: (submitted: boolean) => void
}) => {
  const [fields, setFields] = useState<Record<string, string>>(() => initialHospitalFields(intake))
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const readOnly = intake.status !== 'DRAFT' || !canSubmit
  const fieldsLocked = readOnly || !!intake.examId
  const update = (key: string, value: string) => setFields(previous => ({ ...previous, [key]: value }))
  const save = async (submit: boolean) => {
    if (busy || readOnly) return
    setBusy(true)
    setError('')
    try {
      const payload = intake.examId && intake.submittedFields ? { ...intake.submittedFields } : reviewedHospitalFields(fields)
      await saveHospitalIntake(intake, payload, submit)
      onDone(submit)
    } catch (failure) { setError(intakeError(failure)) }
    finally { setBusy(false) }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); void save(true) }
  const input = (key: string, label: string, type = 'text', required = false, maxLength = 120, metadataOnly = false) =>
    <label className="block text-sm font-semibold text-slate-700">{label}{required ? ' *' : ''}
      <input name={key} type={type} value={fields[key] ?? ''} onChange={event => update(key, event.target.value)}
        required={required} maxLength={maxLength} readOnly={metadataOnly}
        step={['datetime-local', 'time', 'number'].includes(type) ? 'any' : undefined}
        min={type === 'number' ? 0.001 : undefined} max={key === 'heightMeters' ? 10 : key === 'weightKg' ? 10000 : undefined}
        disabled={busy || fieldsLocked} className={fieldClass} />
    </label>
  return <Modal open title={readOnly ? 'Dados do estudo' : 'Revisar e enviar para o ClimbeSoftRad'} description="Conferência do hospital" size="lg" dismissible={!busy} onClose={onClose}>
      <p className="mt-3 text-sm text-slate-600">Os campos disponíveis foram preenchidos a partir do DICOM. Confira a identificação do paciente e complete os campos obrigatórios.</p>
      {intake.status !== 'RECEIVING' && <HospitalDicomPreview intakeId={intake.id} />}
      <div className={`mt-4 rounded-lg p-3 text-sm ${intake.destination ? 'bg-cyan-50 text-cyan-900' : 'bg-amber-50 text-amber-900'}`}>
        {intake.destination ? <><span className="font-bold">Destinatário do envio: ClimbeSoftRad</span><p className="mt-1">Central: {intake.destination.companyName} · Hospital: {intake.destination.unitName}. O estudo fica no hospital até a confirmação do envio.</p></>
          : 'O encaminhamento desta unidade ainda não está configurado. A administração deve definir a empresa destinatária antes do envio.'}
      </div>
      {intake.issues.length > 0 && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        <p className="font-bold">Pontos indicados na importação</p><ul className="mt-2 list-disc pl-5">{intake.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
      </div>}
      <form onSubmit={submit} className="mt-5 space-y-5">
        <fieldset disabled={busy || fieldsLocked} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-bold text-slate-900">Paciente</legend>
          {input('patientName', 'Nome completo', 'text', true)}
          {input('socialName', 'Nome social')}
          {input('birthDate', 'Data de nascimento', 'date', true)}
          <label className="text-sm font-semibold text-slate-700">Sexo cadastral *
            <select name="sex" required value={fields.sex ?? ''} onChange={event => update('sex', event.target.value)} className={fieldClass}>
              <option value="">Selecione</option><option value="FEMININO">Feminino</option><option value="MASCULINO">Masculino</option>
            </select>
          </label>
          {input('identity', 'Documento de identificação', 'text', false, 80)}
          {input('country', 'País', 'text', true, 80)}
          {input('email', 'E-mail', 'email', false, 255)}
          {input('heightMeters', 'Altura (m)', 'number')}
          {input('weightKg', 'Peso (kg)', 'number')}
        </fieldset>
        <fieldset disabled={busy || fieldsLocked} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-bold text-slate-900">Exame</legend>
          {input('studyDescription', 'Descrição do exame', 'text', true, 180)}
          <ModalitySelect label="Modalidade *" value={fields.modality ?? ''} onChange={value=>update('modality',value)} />
          {input('studyDate', 'Data do estudo (DICOM)', 'date', false, 10, true)}
          {input('studyTime', 'Horário do estudo (DICOM)', 'time', false, 16, true)}
          {input('institutionName', 'Instituição informada no DICOM')}
          {input('studyId', 'Identificador do estudo (Study ID)', 'text', false, 64)}
          {input('performedAt', 'Data e hora do exame', 'datetime-local', true)}
          <p className="text-xs leading-5 text-slate-500 sm:col-span-2">A data e o horário do estudo preservam o valor original do arquivo. Confira a data e hora do exame antes de salvar ou enviar; esse campo usa o fuso deste computador: {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p>
          <label className="text-sm font-semibold text-slate-700">Prioridade *
            <select name="priority" required value={fields.priority ?? 'ROTINA'} onChange={event => update('priority', event.target.value)} className={fieldClass}>
              {examPriorities.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          {input('accessionNumber', 'Número de acesso', 'text', false, 80)}
          {input('requesterName', 'Médico solicitante')}
          {input('requesterReference', 'CRM ou referência do solicitante', 'text', false, 140)}
          {input('healthInsurance', 'Convênio', 'text', false, 100)}
        </fieldset>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">{intake.fileCount} arquivo(s) validado(s)</p>
          <p className="mt-1 break-all text-xs">UID DICOM do estudo: {intake.studyUid}</p>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Fechar</Button>
          {!readOnly && <>{!intake.examId && <Button variant="outline" onClick={() => void save(false)} disabled={busy} leftIcon={<Save size={16} />}>Salvar rascunho</Button>}
            <Button type="submit" disabled={busy || !intake.destination} leftIcon={<Send size={16} />}>{busy ? 'Processando…' : 'Enviar para o ClimbeSoftRad'}</Button></>}
        </div>
      </form>
  </Modal>
}
