"use client"
import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  delay?: number
}

export default function Reveal({ children, className = '', as = 'div', delay = 0 }: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          if (delay) (e.target as HTMLElement).style.transitionDelay = `${delay}ms`
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const Comp: any = as
  return (
    <Comp ref={ref} className={`reveal ${className}`}>
      {children}
    </Comp>
  )
}
