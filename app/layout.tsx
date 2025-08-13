import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentSphere - AI-Powered Social Media Simulation',
  description: 'Test your content against thousands of AI agents with unique personas. Get real-time insights into audience engagement and reaction patterns.',
  generator: 'AgentSphere',
  keywords: ['AI', 'social media', 'simulation', 'content testing', 'audience analysis'],
  authors: [{ name: 'AgentSphere Team' }],
  openGraph: {
    title: 'AgentSphere - AI-Powered Social Media Simulation',
    description: 'Test your content against thousands of AI agents with unique personas',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
