import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { themeInitScript } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'RahilArchive — A living archive',
  description: 'An archive of what I build, think, learn, and live.',
  generator: 'v0.app',
}
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: [{ media: '(prefers-color-scheme: light)', color: '#faf9f6' }, { media: '(prefers-color-scheme: dark)', color: '#12110f' }] }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
