"use client"
import dynamic from 'next/dynamic'
import Header from '@/components/Header'

const Workflow = dynamic(() => import('@/components/workflow/WorkflowShell'), { ssr: false })

export default function AppPage() {
  return (
    <main className="relative min-h-[100svh]">
      <Header />
      <Workflow />
    </main>
  )
}
