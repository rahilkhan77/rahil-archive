'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Settings, SitePage } from '@/lib/types'

export function SiteChrome({
  settings,
  pages,
  children,
  withSearch = false,
}: {
  settings: Settings
  pages: SitePage[]
  children: React.ReactNode
  withSearch?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="archive-shell">
      <header className="site-header">
        <Link href="/" className="wordmark">
          {settings.wordmark}
        </Link>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">
          {settings.show_archive ? (
            <Link href="/#archive" onClick={() => setMenuOpen(false)}>
              Archive
            </Link>
          ) : null}
          {settings.show_about ? (
            <Link href="/#about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
          ) : null}
          {settings.show_now ? (
            <Link href="/#now" onClick={() => setMenuOpen(false)}>
              Now
            </Link>
          ) : null}
          {pages.map((page) => (
            <Link key={page.id} href={`/${page.slug}`} onClick={() => setMenuOpen(false)}>
              {page.nav_label}
            </Link>
          ))}
          {withSearch && settings.show_search ? (
            <a href="#search" onClick={() => setMenuOpen(false)} aria-label="Search archive">
              <Search size={15} strokeWidth={1.5} />
            </a>
          ) : null}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <span>{settings.footer_left}</span>
        <span>{settings.footer_center}</span>
        <Link href="/editor">
          Private editor <ArrowUpRight size={13} />
        </Link>
      </footer>
    </main>
  )
}
