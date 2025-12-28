"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${scrolled ? 'backdrop-blur supports-[backdrop-filter]:bg-dark/50 bg-dark/60 border-b border-white/5' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <Image src="/logo.svg" alt="Weavo" fill priority />
          </div>
          <span className="font-semibold tracking-tight">Weavo</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="#components" className="hover:text-white transition">Components</Link>
          <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="#docs" className="hover:text-white transition">Docs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-sm text-white/80 hover:text-white">Sign in</Link>
          <Link href="#cta" className="inline-flex items-center rounded-full bg-white text-dark px-4 py-2 text-sm font-medium shadow-soft hover:shadow-none transition">Get started</Link>
        </div>
      </div>
    </header>
  )
}
