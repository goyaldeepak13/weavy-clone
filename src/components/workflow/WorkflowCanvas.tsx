"use client"
import React, { useCallback, useMemo } from 'react'
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, useEdgesState, useNodesState, addEdge, Connection, Edge } from 'reactflow'
import GlassNode from './nodes/GlassNode'
import 'reactflow/dist/style.css'

const initialNodes = [
  { id: '1', position: { x: 100, y: 120 }, data: { label: 'Trigger', kind: 'Trigger', description: 'When event happens' }, type: 'glass' },
  { id: '2', position: { x: 420, y: 240 }, data: { label: 'Action', kind: 'Action', description: 'Perform action' }, type: 'glass' },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
]

import TextNode from './nodes/TextNode'
import ImageNode from './nodes/ImageNode'
import LLMNode from './nodes/LLMNode'
import AppEdge from './edges/AppEdge'

import { useReactFlow, ReactFlowProvider } from 'reactflow'

function InnerCanvas(props: {
  nodes: any[]
  edges: any[]
  onNodesChange: any
  onEdgesChange: any
  onConnect: any
  setEdges: any
  setNodes: any
  onSelectionChange?: (sel: { nodeIds: string[]; edgeIds: string[] }) => void
  edgeDeleteMode?: boolean
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, onSelectionChange, edgeDeleteMode } = props
  const rf = useReactFlow()
  
  const nodeTypes = useMemo(() => ({ glass: GlassNode, text: TextNode, image: ImageNode, llm: LLMNode }), [])
  const edgeTypes = useMemo(() => ({ app: AppEdge }), [])
  
  return (
    <div className="relative min-h-[calc(100svh-4rem)] bg-transparent">
      <div className="absolute inset-0">
        <ReactFlow edgeTypes={edgeTypes}
          onPaneClick={(e)=>{ console.log('[WF-DEBUG] Pane click', (e.target as HTMLElement)?.className) }}
          onNodeClick={(_, node)=>{ console.log('[WF-DEBUG] Node click', node?.id, node?.type) }}
          onEdgeClick={(_, edge)=>{ console.log('[WF-DEBUG] Edge click', edge?.id); if (edgeDeleteMode) { rf.setEdges((eds:any[])=> eds.filter((e:any)=> e.id !== edge.id)); return } rf.setEdges((eds:any[])=> eds.map((e:any)=> ({ ...e, selected: e.id === edge.id }))) }}
          onEdgeMouseEnter={()=>{ try { document.body.style.cursor='pointer' } catch {} }}
          onEdgeMouseLeave={()=>{ try { document.body.style.cursor='' } catch {} }}
          dragHandle=".drag-area"
          onSelectionChange={({ nodes, edges }) => onSelectionChange?.({ nodeIds: nodes.map((n:any)=>n.id), edgeIds: edges.map((e:any)=>e.id) })}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
          onDrop={(e) => {
            e.preventDefault()
            const type = e.dataTransfer.getData('application/reactflow') as 'text'|'image'|'llm'
            if (!type) return
            const bounds = (e.target as HTMLElement).getBoundingClientRect()
            const position = rf.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })
            setNodes((nds:any[]) => nds.concat({ id: Math.random().toString(36).slice(2,9), type, position, data: { label: type, locked: false }, draggable: true }))
          }}
          elementsSelectable={true}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={true}
          panOnScroll
          panOnDrag
          selectionOnDrag={false}
          zoomOnScroll
          zoomOnPinch
          snapToGrid
          snapGrid={[16,16]}
          edgeOptions={{ style: { stroke: '#7dd3fc', cursor: 'pointer', pointerEvents: 'stroke' }, animated: true, selectable: true }}
          defaultEdgeOptions={{ type: 'app', style: { stroke: '#7dd3fc', cursor: 'pointer', pointerEvents: 'stroke' }, animated: true, selectable: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#4b5563" />
          <MiniMap position="bottom-right" maskColor="rgba(11,15,26,0.6)" nodeColor={() => '#5a72ff'} nodeStrokeColor={() => '#cfd9ff'} />
          <Controls showInteractive={true} position="bottom-left" />
        </ReactFlow>
      </div>
    </div>
  )
}

export default function WorkflowCanvas(props: any) {
  return (
    <ReactFlowProvider>
      <InnerCanvas {...props} />
    </ReactFlowProvider>
  )
}
