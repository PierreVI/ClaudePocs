import { useEffect, useState } from 'react'

interface NumberFieldProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  placeholder?: string
  className?: string
  id?: string
}

function parseDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '' || normalized === '-' || normalized === '.') return null
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

// Free-typing decimal input: accepts ',' or '.' as separator, allows the
// field to sit empty or mid-edit (e.g. "1,") without the controlled value
// snapping back and eating the character the user just typed.
export function NumberField({ value, onChange, min, max, placeholder, className, id }: NumberFieldProps) {
  const [raw, setRaw] = useState(() => String(value))

  useEffect(() => {
    if (parseDecimal(raw) !== value) setRaw(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (!/^[0-9]*[.,]?[0-9]*$/.test(next)) return
    setRaw(next)
    const parsed = parseDecimal(next)
    if (parsed !== null) onChange(parsed)
  }

  function handleBlur() {
    let parsed = parseDecimal(raw)
    if (parsed === null) parsed = value
    if (min !== undefined) parsed = Math.max(min, parsed)
    if (max !== undefined) parsed = Math.min(max, parsed)
    if (parsed !== value) onChange(parsed)
    setRaw(String(parsed))
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={raw}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  )
}
