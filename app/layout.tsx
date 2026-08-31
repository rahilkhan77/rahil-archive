import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'RahilArchive — A living archive', description: 'An archive of what I build, think, learn, and live.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#faf9f6' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="bg-background"><body>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
