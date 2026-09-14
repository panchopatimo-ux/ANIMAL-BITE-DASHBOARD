'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const toDateValue = (value: string) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

const toDateString = (date: Date | undefined) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function DateField({ id, label, value, onChange, fromYear, toYear }: { id: string; label: string; value: string; onChange: (value: string) => void; fromYear: number; toYear: number }) {
  const [open, setOpen] = useState(false)
  const selected = toDateValue(value)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <PopoverTrigger
        render={<Button id={id} type="button" variant="outline" className={cn('h-auto justify-start gap-1.5 rounded border-border bg-background px-2 py-1 text-sm font-normal', !value && 'text-muted-foreground')} />}
      >
        <CalendarIcon className="size-3.5" data-icon="inline-start" />
        {selected ? selected.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'mm/dd/yyyy'}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => { onChange(toDateString(date)); setOpen(false) }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }: { startDate: string; endDate: string; onStartDateChange: (value: string) => void; onEndDateChange: (value: string) => void; onClear: () => void }) {
  const currentYear = new Date().getFullYear()
  const fromYear = 1990
  const toYear = currentYear + 1
  return (
    <div className="flex w-full flex-col gap-1 border-t border-primary/20 pt-2 text-sm font-bold sm:w-auto sm:border-0 sm:pt-0 sm:text-right">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">Filter by registration date</span>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <DateField id="start-date" label="Start date" value={startDate} onChange={onStartDateChange} fromYear={fromYear} toYear={toYear} />
        <span>to</span>
        <DateField id="end-date" label="End date" value={endDate} onChange={onEndDateChange} fromYear={fromYear} toYear={toYear} />
        <button type="button" onClick={onClear} className="rounded border border-primary px-2 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground">Clear</button>
      </div>
    </div>
  )
}
