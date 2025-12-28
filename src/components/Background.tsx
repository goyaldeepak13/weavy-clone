import React from 'react'

export default function Background() {
  return (
    <>
      {/* Radial glow center top */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-radial-faint animate-glow" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-[0.12]" style={{ backgroundSize: 'grid', backgroundPosition: 'center' }} aria-hidden />
        {/* Animated gradient orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-gradient-to-tr from-brand-500/30 via-[#9aa7ff33] to-transparent blur-3xl animate-orb" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 -right-20 w-72 h-72 rounded-full bg-[#7f94ff22] blur-3xl animate-float" />
      </div>
    </>
  )
}
