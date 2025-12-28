"use client"
import { memo, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, useReactFlow } from 'reactflow'

function AppEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, selected } = props
  const rf = useReactFlow()
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })

  const [hover, setHover] = useState(false)
  const selectEdge = () => rf.setEdges((eds: any[]) => eds.map((ed: any) => ({ ...ed, selected: ed.id === id })))
  const onClick = (e: React.MouseEvent) => { e.stopPropagation(); selectEdge() }
  const onEnter = () => { setHover(true); try { document.body.style.cursor = 'pointer' } catch {} }
  const onLeave = () => { setHover(false); try { document.body.style.cursor = '' } catch {} }

  return (
    <>
      {/* visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ ...(style || {}), filter: selected ? 'drop-shadow(0 0 2px rgba(125,211,252,.9))' : undefined }}
        markerEnd={markerEnd}
        interactionWidth={0}
      />
      {/* wide, invisible hit area overlay with small delete handle */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={selected ? 28 : 24}
        style={{ pointerEvents: 'stroke' as any, cursor: 'pointer' }}
        onClick={onClick}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />
      {(hover || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all', zIndex: 1000 }}
            className="nodrag nowheel nopan"
          >
            <button
              title="Delete edge"
              aria-label="Delete edge"
              className="px-2 py-1 text-xs rounded bg-red-500/80 hover:bg-red-500 text-white border border-white/20"
              onClick={(e)=>{ e.stopPropagation(); rf.setEdges((eds:any[])=> eds.filter((e:any)=> e.id !== id)) }}
            >Delete</button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(AppEdge)
