"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import Canvas from './WorkflowCanvas'
import { WorkflowProvider } from './WorkflowContext'
import { useEdgesState, useNodesState, addEdge, Connection, Edge, Node } from 'reactflow'

import DebugOverlay from './DebugOverlay'

export default function WorkflowShell() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // one-time migrate existing edges to custom type without affecting other workflows
  useEffect(() => {
    setEdges((eds:any[]) => eds.map((e:any) => e.type ? e : { ...e, type: 'app' }))
  }, [])

  // simple history stacks
  const history = useRef<{ nodes: any[]; edges: any[] }[]>([])
  const future = useRef<{ nodes: any[]; edges: any[] }[]>([])
  const skipRecord = useRef(false)

  const record = useCallback((n: any[], e: any[]) => {
    if (skipRecord.current) return
    history.current.push({ nodes: JSON.parse(JSON.stringify(n)), edges: JSON.parse(JSON.stringify(e)) })
    if (history.current.length > 100) history.current.shift()
    future.current = []
  }, [])
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [selectedEdges, setSelectedEdges] = useState<string[]>([])
  const shallowEqual = (a: string[], b: string[]) => a.length === b.length && a.every((v,i)=>v===b[i])
  const onSelectionIds = useCallback((sel: { nodeIds: string[]; edgeIds: string[] }) => {
    setSelectedNodes(prev => shallowEqual(prev, sel.nodeIds) ? prev : sel.nodeIds)
    setSelectedEdges(prev => shallowEqual(prev, sel.edgeIds) ? prev : sel.edgeIds)
  }, [])

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        record(nodes, eds)
        const src = nodes.find((n) => n.id === params.source)
        const tHandle = (params as any).targetHandle as string | undefined
        // Enforce type rules: images handle only accepts Image node; system/user only accept Text
        if (tHandle === 'images' && src?.type !== 'image') {
          console.warn('[WF] Invalid connection: only Image node can connect to images handle')
          return eds
        }
        if ((tHandle === 'system_prompt' || tHandle === 'user_message') && src?.type !== 'text') {
          console.warn('[WF] Invalid connection: only Text node can connect to text handles')
          return eds
        }
        // infer color by source node type or target handle
        let stroke = '#7dd3fc'
        if (src?.type === 'image' || tHandle === 'images') stroke = '#fbbf24'
        else if (src?.type === 'llm') stroke = '#c084fc'
        else if (src?.type === 'text' || tHandle === 'system_prompt' || tHandle === 'user_message') stroke = '#7dd3fc'
        const edge = { ...params, animated: true, style: { stroke }, type: 'app' } as any
        return addEdge(edge, eds)
      })
    },
    [setEdges, nodes, record]
  )

  const addNode = useCallback(
    (p: { type: 'text' | 'image' | 'llm'; position?: { x: number; y: number }; data?: any }) => {
      const id = Math.random().toString(36).slice(2, 9)
      const position = p.position ?? { x: 100 + nodes.length * 40, y: 100 + nodes.length * 30 }
      setNodes((nds) =>
        nds.concat({
          id,
          type: p.type,
          position,
          data: { label: p.type, locked: false, ...(p.data ?? {}) },
          draggable: !(p.data?.locked),
        })
      )
    },
    [nodes.length, setNodes]
  )

  const updateNode = useCallback(
    (id: string, data: any) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
                ...n,
                data: { ...n.data, ...data },
                draggable: data.draggable !== undefined ? data.draggable : (data.locked !== undefined ? !data.locked : n.draggable),
              }
            : n
        )
      )
    },
    [setNodes]
  )

  const deleteNodes = useCallback(
    (ids: string[]) => {
      setNodes((nds) => nds.filter((n) => !ids.includes(n.id)))
      setEdges((eds) => eds.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)))
    },
    [setNodes, setEdges]
  )

  const duplicateNode = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const n = nds.find((x) => x.id === id)
        if (!n) return nds
        const newId = Math.random().toString(36).slice(2, 9)
        const pos = { x: n.position.x + 40, y: n.position.y + 40 }
        return nds.concat({ ...n, id: newId, position: pos })
      })
    },
    [setNodes]
  )

  const setLocked = useCallback(
    (id: string, locked: boolean) => {
      updateNode(id, { locked })
    },
    [updateNode]
  )

  const renameNode = useCallback(
    (id: string, label: string) => {
      updateNode(id, { label })
    },
    [updateNode]
  )

  const undo = useCallback(() => {
    if (!history.current.length) return
    const current = { nodes, edges }
    const prev = history.current.pop()!
    skipRecord.current = true
    setNodes(prev.nodes)
    setEdges(prev.edges)
    skipRecord.current = false
    future.current.push({ nodes: JSON.parse(JSON.stringify(current.nodes)), edges: JSON.parse(JSON.stringify(current.edges)) })
  }, [nodes, edges, setNodes, setEdges])

  const redo = useCallback(() => {
    if (!future.current.length) return
    const next = future.current.pop()!
    skipRecord.current = true
    setNodes(next.nodes)
    setEdges(next.edges)
    skipRecord.current = false
    history.current.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) })
  }, [nodes, edges, setNodes, setEdges])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditable = target.closest('input, textarea, [contenteditable="true"]')
      if (isEditable) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // compute selected from both tracked selection and element flags
        const selEdgeIds = Array.from(new Set([
          ...selectedEdges,
          ...edges.filter((ed:any)=> ed.selected).map((ed:any)=> ed.id)
        ]))
        const selNodeIds = Array.from(new Set([
          ...selectedNodes,
          ...nodes.filter((nd:any)=> nd.selected).map((nd:any)=> nd.id)
        ]))
        if (selEdgeIds.length || selNodeIds.length) {
          e.preventDefault()
          record(nodes, edges)
          if (selEdgeIds.length) {
            setEdges((eds)=> eds.filter((e)=> !selEdgeIds.includes(e.id)))
          }
          if (selNodeIds.length) {
            deleteNodes(selNodeIds)
          }
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && selectedNodes.length === 1) {
        e.preventDefault()
        record(nodes, edges)
        duplicateNode(selectedNodes[0])
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault(); undo()
      }
      if (((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)))) {
        e.preventDefault(); redo()
      }
    },
    [selectedNodes, selectedEdges, deleteNodes, duplicateNode, setEdges, record, nodes, edges, undo, redo]
  )

  return (
    <WorkflowProvider
      value={{ addNode, updateNode, deleteNodes, duplicateNode, setLocked, renameNode }}
    >
      <div
        className="grid grid-cols-1 lg:grid-cols-[auto_1fr] min-h-[calc(100svh-4rem)]"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDownCapture={(e)=>{ console.log('[WF-DEBUG] Shell pointerdown capture', (e.target as HTMLElement)?.tagName, (e.target as HTMLElement)?.className) }}
      >
        <Sidebar />
        <Canvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          setEdges={setEdges}
          setNodes={setNodes}
          onSelectionChange={onSelectionIds}
        />
        <DebugOverlay />
      </div>
    </WorkflowProvider>
  )
}
