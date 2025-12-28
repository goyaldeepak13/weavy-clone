"use client"
import { createContext, useContext } from 'react'
import type { XYPosition } from 'reactflow'

export type AddNodePayload = {
  type: 'text' | 'image' | 'llm'
  position?: XYPosition
  data?: Record<string, any>
}

type Ctx = {
  addNode: (p: AddNodePayload) => void
  updateNode: (id: string, data: Record<string, any>) => void
  deleteNodes: (ids: string[]) => void
  duplicateNode: (id: string) => void
  setLocked: (id: string, locked: boolean) => void
  renameNode: (id: string, label: string) => void
}

const WorkflowCtx = createContext<Ctx | null>(null)
export const useWorkflow = () => {
  const ctx = useContext(WorkflowCtx)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}

export function WorkflowProvider({ children, value }: { children: React.ReactNode, value: Ctx }) {
  return <WorkflowCtx.Provider value={value}>{children}</WorkflowCtx.Provider>
}
