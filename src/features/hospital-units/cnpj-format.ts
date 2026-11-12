export const normalizeCnpj = (value: string) => value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 14)

export const formatCnpj = (value: string) => {
  const raw = normalizeCnpj(value)
  return [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 8), raw.slice(8, 12), raw.slice(12)]
    .reduce((formatted, part, index) => part ? formatted + (['', '.', '.', '/', '-'][index] ?? '') + part : formatted, '')
}

export const cnpjCaretPosition = (formatted: string, charactersBeforeCaret: number) => {
  if (!charactersBeforeCaret) return 0
  let count = 0
  for (let index = 0; index < formatted.length; index++) {
    if (/[A-Z0-9]/.test(formatted[index]!) && ++count === charactersBeforeCaret) return index + 1
  }
  return formatted.length
}
