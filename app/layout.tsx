import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VoiceLog',
  description: 'Upload, transcribe, and organize voice recordings',
}

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
