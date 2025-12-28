"use client"
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type DropdownProps = {
  anchorRef: React.RefObject<HTMLElement>
  open: boolean
  onClose: () => void
  children: React.ReactNode
  widthClass?: string
}

export default function DropdownPortal({ anchorRef, open, onClose, children, widthClass = 'w-40' }: DropdownProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const assumedWidth = 200 // px (approx 10-12rem)
    const padding = 8
    let left = rect.left
    // Clamp horizontally within viewport
    left = Math.max(padding, Math.min(left, (window.innerWidth - assumedWidth - padding)))
    let top = rect.bottom + 8
    // Clamp vertically within viewport (approximate 240px height)
    const assumedHeight = 240
    top = Math.max(padding, Math.min(top, window.innerHeight - assumedHeight - padding))
    const next = { top, left }
    console.log('[WF-DEBUG] DropdownPortal useLayoutEffect calc coords', next)
    setCoords(next)
  }, [open])

  useEffect(() => {
    if (!open) return
    console.log('[WF-DEBUG] DropdownPortal open mounted')
    const onDocClick = (e: MouseEvent | PointerEvent) => {
      console.log('[WF-DEBUG] DropdownPortal onDocClick fired', { type: e.type })
      const m = menuRef.current
      const a = anchorRef.current
      if (!m) return
      const inside = m.contains(e.target as Node)
      const onAnchor = !!(a && a.contains(e.target as Node))
      console.log('[WF-DEBUG] DropdownPortal document mousedown', { inside, onAnchor, target: (e.target as HTMLElement)?.tagName })
      if (inside || onAnchor) return
      onClose()
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('pointerup', onDocClick)
    window.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onEsc)
    return () => {
      window.removeEventListener('pointerup', onDocClick)
      window.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null
  if (typeof window === 'undefined') return null

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-[1900] ${widthClass} rounded-lg border border-white/10 bg-white/10 backdrop-blur shadow-card text-sm`}
      style={{ top: coords.top, left: coords.left }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}
