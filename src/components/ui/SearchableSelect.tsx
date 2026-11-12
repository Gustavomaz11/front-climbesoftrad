import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'

export interface SearchableSelectOption {
  id: string
  label: string
}

interface SearchableSelectProps {
  label: string
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  loading?: boolean
  emptyMessage?: string
}

const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')

export const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  error,
  loading = false,
  emptyMessage = 'Nenhuma opção encontrada.',
}: SearchableSelectProps) => {
  const generatedId = useId()
  const feedbackId = `${generatedId}-feedback`
  const [query, setQuery] = useState('')
  const selectedOption = options.find((option) => option.id === value) ?? null
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim())
    if (!normalizedQuery) return options
    return options.filter((option) => normalizeSearch(option.label).includes(normalizedQuery))
  }, [options, query])

  return (
    <Combobox
      value={selectedOption}
      by="id"
      invalid={Boolean(error)}
      onChange={(option) => onChange(option?.id ?? '')}
      onClose={() => setQuery('')}
    >
      <label htmlFor={generatedId} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-slate-400"
        />
        <ComboboxInput
          id={generatedId}
          displayValue={(option: SearchableSelectOption | null) => option?.label ?? ''}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={loading ? 'Carregando opções...' : placeholder}
          autoComplete="off"
          aria-describedby={error ? feedbackId : undefined}
          className={`h-12 w-full rounded-xl border bg-white pr-12 pl-11 text-[0.95rem] text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-3 ${error ? 'border-red-400 focus:border-red-600 focus:ring-red-100' : 'border-slate-300 hover:border-slate-400 focus:border-brand-600 focus:ring-cyan-100'}`}
        />
        <ComboboxButton
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-slate-500 hover:text-brand-700"
          aria-label={`Abrir lista de ${label.toLocaleLowerCase('pt-BR')}`}
        >
          <ChevronsUpDown size={18} aria-hidden="true" />
        </ComboboxButton>
        <ComboboxOptions
          modal={false}
          transition
          className="absolute z-[70] mt-2 max-h-64 w-full origin-top overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition duration-100 empty:invisible data-closed:scale-95 data-closed:opacity-0"
        >
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <ComboboxOption
              key={option.id}
              value={option}
              className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none select-none data-focus:bg-cyan-50 data-focus:text-brand-900"
            >
              <Check size={16} className="invisible shrink-0 text-brand-700 group-data-selected:visible" />
              <span>{option.label}</span>
            </ComboboxOption>
          )) : (
            <div className="px-3 py-5 text-center text-sm text-slate-500">{emptyMessage}</div>
          )}
        </ComboboxOptions>
      </div>
      {error ? <p id={feedbackId} className="mt-1.5 min-h-5 text-xs font-medium text-red-600">{error}</p> : null}
    </Combobox>
  )
}
