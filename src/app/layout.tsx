import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weavo — Collaboration SDK clone',
  description: 'A placeholder brand cloning the Weavy landing experience for demo purposes.',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'Weavo — Collaboration SDK clone',
    description: 'A placeholder brand cloning the Weavy landing experience for demo purposes.',
    url: 'https://example.com',
    siteName: 'Weavo',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Weavo'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weavo — Collaboration SDK clone',
    description: 'A placeholder brand cloning the Weavy landing experience for demo purposes.',
    images: ['/og.png']
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} bg-dark text-white antialiased min-h-full`}> 
        <div className="absolute inset-0 -z-10 bg-radial-faint" aria-hidden />
        <div className="absolute inset-0 -z-20 bg-grid opacity-[0.15]" style={{backgroundSize: 'grid', backgroundPosition: 'center'}} aria-hidden />
        {children}
      </body>
    </html>
  )
}
