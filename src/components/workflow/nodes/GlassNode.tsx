"use client"
import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

import { useWorkflow } from '../WorkflowContext'

function GlassNode({ id, data, selected }: NodeProps) {
  return (
    <div className={`rounded-xl border bg-white/8 backdrop-blur text-white shadow-card ring-1 ring-inset ring-white/10 min-w-[180px] ${selected ? 'outline outline-2 outline-brand-500/60' : ''}`}>
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
         <span className="text-xs uppercase tracking-wide text-white/70 drag-area">{data.label ?? data.kind ?? 'Node'}</span>
        <DeleteButton id={id} />
      </div>
      <div className="px-3 py-3">
        <div className="text-sm font-medium">{data.label}</div>
        {data.description && (
          <div className="text-xs text-white/60 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-brand-500 !border-none" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-brand-500 !border-none" />
    </div>
  )
}

export default memo(GlassNode)

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

