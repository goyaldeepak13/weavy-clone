import Image from 'next/image'
import Link from 'next/link'

import Header from '@/components/Header'
import Background from '@/components/Background'
import Reveal from '@/components/Reveal'

export default function HomePage() {
  return (
    <main className="relative">
      <Background />
      <Header />
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-28 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                The Collaboration SDK
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
                Build chat, feeds, and files into your app
              </h1>
              <p className="mt-5 text-lg text-white/70 max-w-xl">
                Drop-in UI components and APIs to add modern collaboration to any product. Fast to integrate, delightful to use.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="#cta" className="inline-flex items-center rounded-full bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 text-sm font-medium shadow-soft transition">Start free</Link>
                <Link href="#" className="inline-flex items-center rounded-full border border-white/10 bg-white/0 hover:bg-white/5 text-white px-5 py-2.5 text-sm font-medium transition">View docs</Link>
              </div>
              <div className="mt-6 text-sm text-white/60">No credit card required</div>
            </div>
            <div className="relative">
              <div className="absolute -inset-x-20 -top-20 -bottom-10 bg-gradient-to-b from-brand-500/25 to-transparent blur-3xl -z-10" aria-hidden />
              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-2 shadow-card">
                <Image src="/hero-ui.png" alt="Weavo UI preview" width={1200} height={800} className="rounded-xl ring-1 ring-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 sm:py-28 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Everything you need</h2>
          <p className="mt-4 text-white/70 max-w-2xl">Composable components for Chat, Feeds, and Files with enterprise-grade reliability.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {title: 'Chat UI', desc: 'Threads, reactions, typing indicators, and more.'},
              {title: 'Feeds UI', desc: 'Rich posts, comments, and moderation tools.'},
              {title: 'Files UI', desc: 'Uploads, previews, and activity.'},
              {title: 'Auth & Users', desc: 'Bring your own auth; flexible identities.'},
              {title: 'Webhooks & APIs', desc: 'Automate workflows and integrate deeply.'},
              {title: 'Analytics', desc: 'Measure engagement and performance.'},
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
                <div className="h-10 w-10 rounded-lg bg-brand-500/20 ring-1 ring-inset ring-brand-500/40 flex items-center justify-center text-brand-300">★</div>
                <h3 className="mt-4 font-medium text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-white/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-white/70 text-sm">
            <span>© {new Date().getFullYear()} Weavo</span>
            <span className="hidden sm:inline">·</span>
            <Link href="#" className="hover:text-white">Privacy</Link>
            <span className="hidden sm:inline">·</span>
            <Link href="#" className="hover:text-white">Terms</Link>
          </div>
          <div className="text-white/60 text-sm">Placeholder clone for demo purposes</div>
        </div>
      </footer>
    </main>
  )
}
