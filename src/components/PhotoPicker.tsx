import { useRef } from 'react'
import { fileToDataUrl } from '../utils/files'

interface PhotoPickerProps {
  label: string
  value?: string
  onChange: (dataUrl: string) => void
  onClear?: () => void
}

export function PhotoPicker({ label, value, onChange, onClear }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    onChange(dataUrl)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--wood)] bg-white/60 text-2xl"
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          '📷'
        )}
      </button>
      <span className="text-[11px] font-semibold text-[var(--ink-soft)]">{label}</span>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-[var(--danger)] underline"
        >
          retirer
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
