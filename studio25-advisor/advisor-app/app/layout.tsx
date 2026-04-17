import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'studio 2.5 advisor',
  description: 'executive intelligence for infrastructure AI transformation',
  icons: {
    icon: 'https://studio25assets.pages.dev/studio25-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en-CA">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
