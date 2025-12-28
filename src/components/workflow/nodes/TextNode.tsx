"use client"
import { memo, useRef, useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { useWorkflow } from '../WorkflowContext'
import ModalEditor from '../ModalEditor'

function DeleteButton({ id }: { id: string }) {
  const { deleteNodes } = useWorkflow()
  return (
    <button
      type="button"
      aria-label="Delete node"
      title="Delete"
      onPointerUpCapture={(e)=>{ e.preventDefault(); e.stopPropagation(); deleteNodes([id]) }}
      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); deleteNodes([id]) }}
      className="inline-flex items-center justify-center h-6 w-6 rounded border border-white/20 bg-white/10 hover:bg-red-500/20 text-white text-xs nodrag nopan nowheel cursor-pointer"
      style={{ pointerEvents: 'auto' }}
    >
      🗑
    </button>
  )
}

// (Removed legacy NodeMenu)
function TextNode({ id, data, selected }: NodeProps) {
  const { updateNode } = useWorkflow()
  const [text, setText] = useState<string>(data.text ?? '')
  const [editing, setEditing] = useState(false)
  const editBtnRef = useRef<HTMLButtonElement | null>(null)
  // sync incoming data.text into local state without setting state during render
  // this avoids blocking other state updates (like opening the modal)
  useEffect(() => {
    if (data.text !== undefined && data.text !== text) {
      setText(data.text)
    }
  }, [data.text])
  // Sync external editing flag into local state
  useEffect(() => {
    if (data.editing && !editing) {
      setEditing(true)
    }
    if (!data.editing && editing) {
      setEditing(false)
    }
  }, [data.editing, editing])
  // native pointerup fallback to ensure handler fires
  useEffect(() => {
    const el = editBtnRef.current
    if (!el) return
    const handler = (e: Event) => { console.log('[WF-DEBUG] TextNode Edit button native pointerup'); updateNode(id, { editing: true }); setTimeout(()=> setEditing(true), 0) }
    el.addEventListener('pointerup', handler)
    return () => { el.removeEventListener('pointerup', handler) }
  }, [editBtnRef.current, id, updateNode])
  return (
    <div 
      className={`rounded-xl border bg-white/8 backdrop-blur text-white shadow-card ring-1 ring-inset ring-white/10 min-w-[220px] ${selected ? 'outline outline-2 outline-brand-500/60' : ''}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between" onMouseDown={()=>console.log('[WF-DEBUG] TextNode header mousedown')}>
        <span className="text-xs uppercase tracking-wide text-white/70 drag-area">{data.label ?? 'Text'}</span>
        <DeleteButton id={id} />
      </div>
      <div className="px-3 py-3">
        <div className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white/60 flex items-center justify-between">
          <span className="truncate">{text || 'Enter text'}</span>
          <button
            ref={(el)=>{ (editBtnRef as any).current = el }}
            type="button"
            tabIndex={0}
            className="ml-2 h-8 px-3 rounded border border-white/15 bg-white/5 hover:bg-white/10 text-white/90"
            onPointerUpCapture={(e)=>{ console.log('[WF-DEBUG] TextNode Edit button pointerup'); updateNode(id, { editing: true }); setTimeout(()=> setEditing(true), 0) }}
            onKeyDown={(e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); console.log('[WF-DEBUG] TextNode Edit button keydown'); updateNode(id, { editing: true }); setTimeout(()=> setEditing(true), 0) } }}
            onClick={(e)=>{ console.log('[WF-DEBUG] TextNode Edit button click'); updateNode(id, { editing: true }); setTimeout(()=> setEditing(true), 0) }}
          >Edit</button>
        </div>
        <ModalEditor
          open={editing || !!data.editing}
          value={text}
          onChange={(v)=>{ setText(v); updateNode(id, { text: v }) }}
          onClose={()=> { setEditing(false); updateNode(id, { editing: false }) }}
        />
      </div>
      <Handle type="source" id="output" position={Position.Right} className="!w-2 !h-2 !bg-sky-400 !border-none" />
    </div>
  )
}

export default memo(TextNode)
