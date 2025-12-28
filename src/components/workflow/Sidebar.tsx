"use client"
import { useState } from 'react'
import { useWorkflow } from './WorkflowContext'

function QuickButton({ label, type }: { label: string, type: 'text'|'image'|'llm' }) {
  const { addNode } = useWorkflow()
  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow', type)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => addNode({ type })}
      className="h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
    >
      {label}
    </button>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`border-r border-white/10 bg-white/5 backdrop-blur transition-all duration-300 overflow-hidden ${open ? 'w-full lg:w-[300px]' : 'w-0 lg:w-[56px]'} `} data-state={open ? 'open' : 'closed'}>
      <div className="h-full flex flex-col">
        <div className="h-14 flex items-center gap-2 px-3 border-b border-white/10">
          <button
            aria-label={open ? 'Collapse' : 'Expand'}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <span className="i text-lg leading-none">{open ? '⟨' : '⟩'}</span>
          </button>
          {open && (
            <div className="flex-1">
              <input
                placeholder="Search"
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          )}
        </div>

        {open && (
          <div className="p-3 space-y-4 overflow-y-auto">
            <section>
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">Quick Access</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                {label: 'Text Node', type: 'text'},
                {label: 'Image Node', type: 'image'},
                {label: 'Run Any LLM Node', type: 'llm'}
              ].map(({label, type}) => (
                <QuickButton key={label} label={label} type={type as any} />
              ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">Nodes</h3>
              <div className="space-y-2">
                {['Trigger', 'Action', 'Condition', 'Delay'].map((x) => (
                  <div key={x} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                    <span className="text-sm">{x}</span>
                    <span className="text-white/40">⋮</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </aside>
  )
}
