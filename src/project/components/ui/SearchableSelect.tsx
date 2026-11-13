import { useId, useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
export interface SearchableSelectOption { id: string; label: string }
interface SearchableSelectProps { label: string; options: SearchableSelectOption[]; value: string; onChange: (value: string) => void; placeholder?: string; error?: string; loading?: boolean; emptyMessage?: string }
export const SearchableSelect = ({ label, options, value, onChange, placeholder = 'Selecione uma opção', error, loading = false, emptyMessage = 'Nenhuma opção encontrada.' }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  const selected = useMemo(() => options.find(option => option.id === value), [options, value])
  return <div className="space-y-2"><Label htmlFor={id} className="text-xs font-medium">{label}</Label>
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button id={id} variant="outline" role="combobox" aria-expanded={open} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : undefined} className="h-10 w-full justify-between gap-2 bg-card px-3 text-left font-normal shadow-none">
      <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>{loading ? 'Carregando opções…' : selected?.label || placeholder}</span><ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
    </Button></PopoverTrigger><PopoverContent align="start" className="z-[80] w-[var(--radix-popover-trigger-width)] p-0"><Command><CommandInput placeholder={'Buscar ' + label.toLocaleLowerCase('pt-BR') + '?'} /><CommandList><CommandEmpty>{emptyMessage}</CommandEmpty>{options.map(option => <CommandItem key={option.id} value={option.id + ' ' + option.label} onSelect={() => { onChange(option.id); setOpen(false) }} className="gap-2 py-2.5"><Check className={value === option.id ? 'size-4 text-primary' : 'size-4 opacity-0'} /><span>{option.label}</span></CommandItem>)}</CommandList></Command></PopoverContent></Popover>{error && <p id={id + '-error'} className="text-xs text-red-600">{error}</p>}
  </div>
}
