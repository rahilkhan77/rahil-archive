'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import type { Post, Settings } from '@/lib/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`),
  )
}

export function ArchiveHome({ posts, settings }: { posts: Post[]; settings: Settings }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Post | null>(null)

  const filtered = useMemo(
    () =>
      posts.filter((post) =>
        `${post.title} ${post.excerpt ?? ''} ${post.content}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [posts, query],
  )

  return (
    <main className="archive-shell">
      <header className="site-header">
        <Link href="/" className="wordmark">
          RahilArchive
        </Link>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">
          <a href="#archive" onClick={() => setMenuOpen(false)}>
            Archive
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#now" onClick={() => setMenuOpen(false)}>
            Now
          </a>
          <a href="#search" onClick={() => setMenuOpen(false)} aria-label="Search archive">
            <Search size={15} strokeWidth={1.5} />
          </a>
        </nav>
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">A living archive · est. 2026</p>
        <h1>
          Things I build,
          <br />
          <em>think, learn,</em>
          <br />
          and live.
        </h1>
        <p className="hero-note">A quiet place for the work, questions, failures, and ordinary days worth keeping.</p>
      </section>

      <section id="archive" className="archive-section">
        <div className="section-heading">
          <span>Archive</span>
          <span className="count">
            {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div className="archive-list">
          {filtered.map((post) => (
            <button key={post.id} className="archive-row" onClick={() => setSelected(post)}>
              <time>{formatDate(post.date)}</time>
              <div className="row-copy">
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
              </div>
              <ArrowUpRight className="row-arrow" size={18} strokeWidth={1.3} />
            </button>
          ))}
        </div>
      </section>

      <section id="about" className="split-section">
        <div className="section-heading">
          <span>About</span>
        </div>
        <div className="script-copy">{settings.about_content}</div>
      </section>
      <section id="now" className="split-section now-section">
        <div className="section-heading">
          <span>Now</span>
          <span className="count">Updated today</span>
        </div>
        <div className="script-copy">{settings.now_content}</div>
      </section>

      <section id="search" className="search-section">
        <div className="section-heading">
          <span>Search the archive</span>
        </div>
        <div className="search-field">
          <Search size={18} strokeWidth={1.4} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “building”, “life”, or “travel”"
            aria-label="Search archive"
          />
          {query ? (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null}
        </div>
        {query ? (
          <p className="search-result">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} found
          </p>
        ) : null}
      </section>

      <footer className="site-footer">
        <span>RahilArchive</span>
        <span>Made slowly, kept forever.</span>
        <Link href="/editor">
          Private editor <ArrowUpRight size={13} />
        </Link>
      </footer>

      {selected ? (
        <div className="reading-overlay" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button className="close-reading" onClick={() => setSelected(null)} aria-label="Close reading view">
            <X size={20} />
          </button>
          <article className="reading-view">
            <time>{formatDate(selected.date)}</time>
            <h1>{selected.title}</h1>
            <p className="reading-excerpt">{selected.excerpt}</p>
            <div className="script-reading">
              {selected.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  )
}
