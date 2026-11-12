export const hospitalBirthDateLabel = (value: unknown, today = new Date()) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Nascimento pendente'
  const birth = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) return 'Nascimento pendente'
  let age = today.getFullYear() - birth.getUTCFullYear()
  if (today.getMonth() < birth.getUTCMonth() ||
    (today.getMonth() === birth.getUTCMonth() && today.getDate() < birth.getUTCDate())) age--
  if (age < 0) return 'Nascimento pendente'
  const date = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(birth)
  return `${date} · ${age} ${age === 1 ? 'ano' : 'anos'}`
}
