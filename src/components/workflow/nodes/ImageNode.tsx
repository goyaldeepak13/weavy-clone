"use client"
import { memo, useRef, useState, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { useWorkflow } from '../WorkflowContext'
// Dropdown removed for simplified delete button

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
    >
      🗑
    </button>
  )
}

function ImageNode({ id, data, selected }: NodeProps) {
  const { updateNode } = useWorkflow()
  const initialBase64 = (typeof data.base64 === 'string' && data.base64.startsWith('data:image/')) ? data.base64 : null
  const [base64, setBase64] = useState<string | null>(initialBase64)
  const [fileName, setFileName] = useState<string | null>(data.fileName ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [imgKey, setImgKey] = useState(0)
  const [showMeta, setShowMeta] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inputId = `${id}-file-input`
  
  // Native fallback: ensure change fires even if React synthetic event gets lost on remount
  useEffect(() => {
    const el = fileInputRef.current
    if (!el) return
    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement
      const f = input.files?.[0]
      console.log('[WF-DEBUG] ImageNode native file input change', { hasFile: !!f, name: f?.name, size: f?.size })
      if (f) {
        onFile(f)
      }
      input.value = ''
    }
    el.addEventListener('change', handler)
    return () => { el.removeEventListener('change', handler) }
  }, [fileInputRef.current])
  
  // On first mount: if there is no persisted image, reset any local preview/base64 leftovers (dev fast-refresh safety)
  useEffect(() => {
    if (!data.base64) {
      setPreviewUrl((prev)=>{ if (prev) { try { URL.revokeObjectURL(prev) } catch {} } return null })
      setBase64(null)
      setFileName(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync state with data updates (base64/fileName only)
  useEffect(() => {
    const isValidDataUrl = (v: any) => typeof v === 'string' && v.startsWith('data:image/')
    // when external data changes, sync local state
    if (data.base64 !== undefined) {
      if (isValidDataUrl(data.base64)) {
        if (data.base64 !== base64) setBase64(data.base64)
        // if a base64 is present, prefer it over object URL for persistence
        setPreviewUrl((prev)=>{ if (prev) { try { URL.revokeObjectURL(prev) } catch {} } return null })
      } else if (base64 !== null) {
        setBase64(null)
      }
    }
    if (data.fileName !== undefined && data.fileName !== fileName) {
      setFileName(data.fileName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.base64, data.fileName])

  // cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl) } catch {}
      }
    }
  }, [previewUrl])
  
  const onFile = async (file: File) => {
    try {
      // one-tick reset to force old preview to unmount
      setPreviewUrl((prev)=>{ if (prev) { try { URL.revokeObjectURL(prev) } catch {} } return null })
      setImgKey((k)=>k+1)
      setBase64(null)
      setFileName(null)
      await new Promise((r)=> setTimeout(r, 0))

      // use object URL for preview immediately (avoids huge data URL causing issues)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setLoadError(null)
      const reader = new FileReader()
      reader.onload = () => {
        const res = reader.result as string
        setBase64(res)
        setFileName(file.name)
        updateNode(id, { base64: res, fileName: file.name, mime: file.type, size: file.size })
        console.log('[WF-DEBUG] ImageNode saved', { id, name: file.name, type: file.type, size: file.size, len: res.length })
        // force a fresh <img> mount with the new src
        setImgKey((k)=>k+1)
        setSaved(true)
        setTimeout(()=> setSaved(false), 1500)
      }
      reader.onerror = (e) => {
        console.warn('[WF-DEBUG] ImageNode FileReader error', e)
        setLoadError('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (e) {
      console.warn('[WF-DEBUG] ImageNode onFile error', e)
    }
  }
  
  // Resolve display source: prefer preview object URL, then persisted base64
  const persisted = typeof data.base64 === 'string' && data.base64.startsWith('data:image/') ? data.base64 : null
  const displaySrc = previewUrl || persisted
  const renderSrc = displaySrc ? `${displaySrc}#k=${imgKey}` : null
  
  return (
    <div 
      className={`rounded-xl border bg-white/8 backdrop-blur text-white shadow-card ring-1 ring-inset ring-white/10 min-w-[260px] ${selected ? 'outline outline-2 outline-brand-500/60' : ''}`}
      style={{ pointerEvents: 'all' }}
    >
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-white/70 drag-area">{data.label ?? 'Image'}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View data"
            aria-label="View data"
            className="inline-flex items-center justify-center h-6 w-6 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs"
            onClick={(e)=>{ e.stopPropagation(); setShowMeta(v=>!v) }}
          >ℹ️</button>
          <button
            type="button"
            title="Clear image"
            aria-label="Clear image"
            className="inline-flex items-center justify-center h-6 w-6 rounded border border-white/20 bg-white/10 hover:bg-red-500/20 text-white text-xs"
            onClick={(e)=>{ 
              e.stopPropagation();
              setPreviewUrl((prev)=>{ if (prev) { try { URL.revokeObjectURL(prev) } catch {} } return null })
              setBase64(null)
              setFileName(null)
              setImgKey((k)=>k+1)
              // update node data
              updateNode(id, { base64: null, fileName: null, mime: null, size: null })
            }}
          >✖️</button>
          <DeleteButton id={id} />
        </div>
      </div>
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white nodrag"
            onPointerDownCapture={(e)=>{ e.preventDefault(); e.stopPropagation() }}
            onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation() }}
            onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); console.log('[WF-DEBUG] ImageNode upload button click', { id }); const el = fileInputRef.current; if (el) { requestAnimationFrame(()=> el.click()) } else { const lab = document.querySelector(`label[for='${inputId}']`) as HTMLLabelElement | null; lab?.click() } }}
            title="Upload image"
            aria-label="Upload image"
          >
            ⬆️
          </button>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            // fixed in-viewport 1x1, fully transparent so click is a user gesture
            className="fixed w-px h-px left-0 top-0 opacity-0"
            onChange={(e)=>{
              const input = e.target as HTMLInputElement
              const f = input.files?.[0]
              console.log('[WF-DEBUG] ImageNode file input onChange', { hasFile: !!f, name: f?.name, size: f?.size })
              if (f) {
                onFile(f)
              } else {
                console.log('[WF-DEBUG] ImageNode onChange no file selected (dialog canceled?)')
              }
              input.value = ''
            }}
          />
          {displaySrc && (
            <span className="text-xs text-white/60">{fileName ? `Attached: ${fileName}` : 'Attached'}</span>
          )}
          {saved && (
            <span className="text-xs text-emerald-400">Saved</span>
          )}
        </div>
        {displaySrc ? (
          <div
            className="rounded-lg overflow-hidden border border-white/10 bg-black/20"
            onDragOver={(e)=>{ e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy' }}
            onDrop={(e)=>{ e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) { console.log('[WF-DEBUG] ImageNode drop', { name: f.name, size: f.size, type: f.type }); onFile(f) } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgKey}
              src={renderSrc!}
              alt="preview"
              className="max-h-48 object-contain w-full cursor-pointer"
              onClick={(e)=>{ e.stopPropagation(); fileInputRef.current?.click() }}
              onLoad={()=>{ console.log('[WF-DEBUG] ImageNode preview onLoad', { id, len: displaySrc?.length, key: imgKey }); setLoadError(null) }}
              onError={(e)=>{ console.warn('[WF-DEBUG] ImageNode preview onError', { id, key: imgKey }); setLoadError('Failed to display image'); }}
            />
            {loadError && (
              <div className="p-2 text-xs text-red-400 bg-black/60 border-t border-red-500/40">{loadError}</div>
            )}
            {showMeta && (
              <div className="p-2 text-xs text-white/80 bg-black/60 border-t border-white/10 whitespace-pre-wrap">
                {JSON.stringify({ fileName: fileName ?? data.fileName ?? null, mime: data.mime ?? null, size: data.size ?? null, hasBase64: !!(data.base64 || base64), base64Len: (data.base64 || base64)?.length ?? 0 }, null, 2)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-white/50">No image attached • Click ⬆️ to upload</div>
        )}
      </div>
      <Handle type="source" id="output" position={Position.Right} className="!w-2 !h-2 !bg-amber-400 !border-none" />
    </div>
  )
}

export default memo(ImageNode)
