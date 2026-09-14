import { NextResponse } from 'next/server'

const KOBO_URL = 'https://kf.kobotoolbox.org/api/v2/assets/ah6sJ6TWgKpLUWost5Qx7Y/export-settings/esbsTRY4GYdeetmNb7iubZT/data.csv'

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const delimiter = (lines[0].match(/;/g)?.length || 0) > (lines[0].match(/,/g)?.length || 0) ? ';' : ','
  const parseLine = (line: string) => { const values: string[] = []; let value = ''; let quoted = false; for (const char of line) { if (char === '"') quoted = !quoted; else if (char === delimiter && !quoted) { values.push(value.trim()); value = '' } else value += char } values.push(value.trim()); return values }
  const headers = parseLine(lines[0]).map((header) => header.replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => { const values = parseLine(line); return headers.reduce<Record<string, string>>((row, header, index) => { row[header] = values[index]?.replace(/^"|"$/g, '') || ''; return row }, {}) })
}

export async function GET() {
  try {
    const response = await fetch(KOBO_URL, { cache: 'no-store', headers: { Accept: 'text/csv' } })
    if (!response.ok) return NextResponse.json({ rows: [], fetchedAt: new Date().toISOString(), error: `Kobo returned ${response.status}` }, { status: 502 })
    const text = await response.text()
    return NextResponse.json({ rows: parseCsv(text), fetchedAt: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ rows: [], fetchedAt: new Date().toISOString(), error: error instanceof Error ? error.message : 'Unable to reach KoboToolbox' }, { status: 502 })
  }
}
