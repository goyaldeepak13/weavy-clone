"use client"
import { useEffect, useRef } from 'react'

export default function ModalEditor({
  open,
  title = 'Edit Text',
  value,
  onChange,
  onClose,
}: {
  open: boolean
  title?: string
  value: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const t = ref.current
    if (t) {
      t.focus()
      t.setSelectionRange(t.value.length, t.value.length)
    }
  }, [open])

  if (!open) return null

  const onCloseNow = () => { const v = (ref.current?.value ?? value); onChange(v); onClose() }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60" onPointerDown={(e)=> e.stopPropagation()} onMouseDown={(e)=> e.stopPropagation()}>
      <div className="w-[min(92vw,640px)] bg-dark border border-white/15 rounded-xl shadow-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white/90">{title}</h3>
          <button
            type="button"
            className="text-white/80 hover:text-white px-2 py-1 rounded border border-white/15"
            onPointerUpCapture={onCloseNow}
            onClick={onCloseNow}
          >Close</button>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              const v = (ref.current?.value ?? value)
              onChange(v)
              onClose()
            }
          }}
          rows={12}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 text-white placeholder-white/40 resize-vertical"
          placeholder="Enter text"
        />
      </div>
    </div>
  )
}
