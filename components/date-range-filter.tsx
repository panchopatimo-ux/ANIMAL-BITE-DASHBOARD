'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const toDateValue = (value: string) => {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const toDateString = (date: Date | undefined) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDisplayValue = (date: Date | undefined) => (date ? date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '')

// Parses flexible manual typing like "9/15/2024" or "09-15-2024" into an ISO date string.
const parseTypedDate = (text: string) => {
  const match = text.trim().match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return toDateString(date)
}

function DateField({ id, label, value, onChange, fromYear, toYear }: { id: string; label: string; value: string; onChange: (value: string) => void; fromYear: number; toYear: number }) {
  const [open, setOpen] = useState(false)
  const selected = toDateValue(value)
  const [text, setText] = useState(toDisplayValue(selected))

  useEffect(() => {
    setText(toDisplayValue(selected))
  }, [value])

  const commitTypedText = () => {
    if (!text.trim()) {
      onChange('')
      return
    }
    const parsed = parseTypedDate(text)
    if (parsed) {
      onChange(parsed)
    } else {
      setText(toDisplayValue(selected))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <InputGroup className="h-auto w-[150px] rounded border-border bg-background">
        <InputGroupInput
          id={id}
          placeholder="mm/dd/yyyy"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commitTypedText}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitTypedText()
            }
          }}
          className="px-2 py-1 text-sm"
        />
        <InputGroupAddon align="inline-end" className="pr-1">
          <PopoverTrigger
            render={<InputGroupButton type="button" size="icon-xs" variant="ghost" aria-label={`Open ${label.toLowerCase()} calendar`} />}
          >
            <CalendarIcon />
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>
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
