"use client"
import { memo, useRef, useState, useEffect } from 'react'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'

import { useWorkflow } from '../WorkflowContext'
// Dropdown removed for simplified delete button

function LLMNode({ id, data, selected }: NodeProps) {
  const rf = useReactFlow()
  const [system, setSystem] = useState<string>('')
  const [model, setModel] = useState<string>('gemini-1.5-flash')
  // removed local user input; user message must come from connected Text node
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<string>('')

  // Aggregate inputs from connected nodes
  const gatherInputs = () => {
    const edges = rf.getEdges()
    const nodes = rf.getNodes()
    const incoming = edges.filter(e => e.target === id)
    let sys: string | undefined
    let usr: string | undefined
    const imgs: string[] = []
    for (const e of incoming) {
      const src = nodes.find(n => n.id === e.source)
      if (!src) continue
      if (e.targetHandle === 'system_prompt') {
        if (typeof src.data?.text === 'string') sys = src.data.text
      } else if (e.targetHandle === 'user_message') {
        if (typeof src.data?.text === 'string') usr = src.data.text
      } else if (e.targetHandle === 'images') {
        const b64 = src.data?.base64
        if (typeof b64 === 'string') imgs.push(b64)
      }
    }
    return { sys, usr, imgs }
  }

  const run = async () => {
    setLoading(true); setError(null); setOutput('')
    try {
      const { sys, usr, imgs } = gatherInputs()
      const finalSystem = sys ?? system
      const finalUser = usr
      if (!finalUser || !finalUser.trim()) {
        throw new Error('User message is required — connect a Text node to the user_message handle on this LLM node')
      }
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, system: finalSystem, input: finalUser, images: imgs })
      })
      if (!res.ok) {
        let msg = 'Request failed'
        try {
          const j = await res.json()
          msg = j?.error || j?.details || msg
        } catch {
          try { msg = await res.text() } catch {}
        }
        throw new Error(msg)
      }
      const json = await res.json()
      setOutput(json.output ?? '')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-xl border bg-white/8 backdrop-blur text-white shadow-card ring-1 ring-inset ring-white/10 min-w-[320px] ${selected ? 'outline outline-2 outline-brand-500/60' : ''}`}>
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
         <span className="text-xs uppercase tracking-wide text-white/70 drag-area">{data.label ?? 'Run Any LLM'}</span>
        <DeleteButton id={id} />
      </div>
      <div className="px-3 py-3 space-y-2">
        <div className="flex gap-2">
          <select value={model} onChange={(e)=>setModel(e.target.value)} className="h-9 flex-1 bg-white/5 border border-white/10 rounded-lg px-2 text-sm text-white">
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
            <option value="gemini-2.5-flash-tts">gemini-2.5-flash-tts</option>
            <option value="gemini-3-flash">gemini-3-flash</option>
            <option value="gemini-robotics-er-1.5-preview">gemini-robotics-er-1.5-preview</option>
            <option value="gemma-3-12b">gemma-3-12b</option>
            <option value="gemma-3-1b">gemma-3-1b</option>
            <option value="gemma-3-27b">gemma-3-27b</option>
            <option value="gemma-3-2b">gemma-3-2b</option>
            <option value="gemma-3-4b">gemma-3-4b</option>
            <option value="gemini-2.5-flash-native-audio-dialog">gemini-2.5-flash-native-audio-dialog</option>
          </select>
        </div>
        <input value={system} onChange={(e)=>setSystem(e.target.value)} placeholder="System prompt (optional)" className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-2 text-sm" />
        <div className="flex items-center gap-2">
          <button onClick={run} disabled={loading} className="h-9 px-4 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Running…' : 'Run'}</button>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
        {output && (
          <div className="text-sm text-white/80 bg-black/30 border border-white/10 rounded-lg p-2 whitespace-pre-wrap">
            {output}
          </div>
        )}
      </div>
      <Handle
        type="target"
        id="user_message"
        position={Position.Left}
        style={{ top: 52 }}
        className="!w-2 !h-2 !bg-sky-400 !border-none"
        isValidConnection={(c)=>{
          const n = rf.getNode(c.source as string)
          return !!n && n.type === 'text' && (c.sourceHandle === 'output' || !c.sourceHandle)
        }}
      />
      <Handle
        type="target"
        id="images"
        position={Position.Left}
        style={{ top: 80 }}
        className="!w-2 !h-2 !bg-amber-400 !border-none"
        isValidConnection={(c)=>{
          const n = rf.getNode(c.source as string)
          return !!n && n.type === 'image' && (c.sourceHandle === 'output' || !c.sourceHandle)
        }}
      />
      <Handle type="source" id="output" position={Position.Right} className="!w-2 !h-2 !bg-purple-400 !border-none" />
    </div>
  )
}

export default memo(LLMNode)

import DropdownPortal from '../Dropdown'

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

