'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { removePage, removePost, savePage, savePost, saveSettings, signOut } from '@/app/editor/actions'
import { ComposeFields, type DraftFields } from '@/app/editor/compose-form'
import { defaultAppearance } from '@/lib/defaults'
import type { Post, Settings, SitePage } from '@/lib/types'

type Tab = 'entries' | 'pages' | 'site' | 'look'

const emptyEntry = (): DraftFields & { id: string; status: Post['status'] } => ({
  id: '',
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'published',
  media: [],
})

const emptyPage = (): DraftFields & { id: string; status: SitePage['status']; nav_label: string; slug: string } => ({
  id: '',
  title: '',
  nav_label: '',
  slug: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'published',
  media: [],
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`),
  )
}

export function EditorStudio({
  email,
  initialPosts,
  initialPages,
  initialSettings,
  useBlob,
}: {
  email: string
  initialPosts: Post[]
  initialPages: SitePage[]
  initialSettings: Settings
  useBlob: boolean
}) {
  const [tab, setTab] = useState<Tab>('entries')
  const [posts, setPosts] = useState(initialPosts)
  const [pages, setPages] = useState(initialPages)
  const [settings, setSettings] = useState(initialSettings)
  const [entry, setEntry] = useState(emptyEntry())
  const [page, setPage] = useState(emptyPage())
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  )

  const persistEntry = (status: Post['status']) => {
    startTransition(async () => {
      const result = await savePost({ ...entry, id: entry.id || undefined, status })
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setPosts(result.posts)
      setEntry({
        id: result.post.id,
        title: result.post.title,
        excerpt: result.post.excerpt ?? '',
        content: result.post.content,
        date: result.post.date,
        status: result.post.status,
        media: result.post.media ?? [],
      })
      setMessage(status === 'published' ? 'Published to the homepage.' : 'Saved as a draft.')
    })
  }

  const persistPage = (status: SitePage['status']) => {
    startTransition(async () => {
      const result = await savePage({
        ...page,
        id: page.id || undefined,
        nav_label: page.nav_label,
        slug: page.slug,
        status,
      })
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setPages(result.pages)
      setPage({
        id: result.page.id,
        title: result.page.title,
        nav_label: result.page.nav_label,
        slug: result.page.slug,
        excerpt: result.page.excerpt ?? '',
        content: result.page.content,
        date: result.page.date,
        status: result.page.status,
        media: result.page.media ?? [],
      })
      setMessage(status === 'published' ? `Page live at /${result.page.slug}` : 'Page saved as a draft.')
    })
  }

  const persistSettings = () => {
    startTransition(async () => {
      const result = await saveSettings(settings)
      setSettings(result.settings)
      setMessage('Site details saved.')
    })
  }

  return (
    <div className="editor-studio">
      <header className="editor-toolbar">
        <div>
          <p className="eyebrow">Signed in as {email}</p>
          <h1>
            Shape the
            <br />
            <em>archive.</em>
          </h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="ghost-button">
            Sign out
          </button>
        </form>
      </header>

      <div className="editor-tabs" role="tablist">
        {([
          ['entries', 'Entries'],
          ['pages', 'Pages'],
          ['site', 'Details'],
          ['look', 'Look'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-active' : ''}
            onClick={() => {
              setTab(id)
              setMessage('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'entries' ? (
        <div className="editor-layout">
          <aside className="editor-list">
            <div className="section-heading">
              <span>Entries</span>
              <span className="count">{posts.length}</span>
            </div>
            <button
              type="button"
              className="new-entry"
              onClick={() => {
                setEntry(emptyEntry())
                setMessage('')
              }}
            >
              New entry
            </button>
            {sortedPosts.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === entry.id ? 'entry-chip is-active' : 'entry-chip'}
                onClick={() =>
                  setEntry({
                    id: item.id,
                    title: item.title,
                    excerpt: item.excerpt ?? '',
                    content: item.content,
                    date: item.date,
                    status: item.status,
                    media: item.media ?? [],
                  })
                }
              >
                <strong>{item.title}</strong>
                <span>
                  {formatDate(item.date)} · {item.status}
                </span>
              </button>
            ))}
          </aside>
          <section className="editor-compose">
            <ComposeFields
              draft={entry}
              setDraft={(next) => setEntry({ ...entry, ...next })}
              useBlob={useBlob}
              onMessage={setMessage}
              uploading={uploading}
              setUploading={setUploading}
            />
            <div className="editor-actions">
              <button type="button" disabled={pending || uploading} onClick={() => persistEntry('published')}>
                {pending ? 'Saving…' : 'Publish to homepage'}
              </button>
              <button type="button" className="ghost-button" disabled={pending || uploading} onClick={() => persistEntry('draft')}>
                Save draft
              </button>
              {entry.id ? (
                <button
                  type="button"
                  className="danger-button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await removePost(entry.id)
                      setPosts(result.posts)
                      setEntry(emptyEntry())
                      setMessage('Entry deleted.')
                    })
                  }
                >
                  Delete
                </button>
              ) : null}
            </div>
            {message ? <p className="editor-message">{message}</p> : null}
          </section>
        </div>
      ) : null}

      {tab === 'pages' ? (
        <div className="editor-layout">
          <aside className="editor-list">
            <div className="section-heading">
              <span>Pages</span>
              <span className="count">{pages.length}</span>
            </div>
            <button
              type="button"
              className="new-entry"
              onClick={() => {
                setPage(emptyPage())
                setMessage('')
              }}
            >
              New page
            </button>
            {pages.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === page.id ? 'entry-chip is-active' : 'entry-chip'}
                onClick={() =>
                  setPage({
                    id: item.id,
                    title: item.title,
                    nav_label: item.nav_label,
                    slug: item.slug,
                    excerpt: item.excerpt ?? '',
                    content: item.content,
                    date: item.date,
                    status: item.status,
                    media: item.media ?? [],
                  })
                }
              >
                <strong>{item.title}</strong>
                <span>
                  /{item.slug} · {item.status}
                </span>
              </button>
            ))}
          </aside>
          <section className="editor-compose">
            <ComposeFields
              draft={page}
              setDraft={(next) => setPage({ ...page, ...next })}
              useBlob={useBlob}
              onMessage={setMessage}
              uploading={uploading}
              setUploading={setUploading}
              extra={
                <>
                  <label>
                    Nav label
                    <input
                      value={page.nav_label}
                      onChange={(event) => setPage({ ...page, nav_label: event.target.value })}
                      placeholder="Shown in the header"
                    />
                  </label>
                  <label>
                    URL slug
                    <input
                      value={page.slug}
                      onChange={(event) => setPage({ ...page, slug: event.target.value })}
                      placeholder="projects"
                    />
                  </label>
                </>
              }
            />
            <div className="editor-actions">
              <button type="button" disabled={pending || uploading} onClick={() => persistPage('published')}>
                {pending ? 'Saving…' : 'Publish page'}
              </button>
              <button type="button" className="ghost-button" disabled={pending || uploading} onClick={() => persistPage('draft')}>
                Save draft
              </button>
              {page.id ? (
                <Link href={`/${page.slug}`} className="ghost-button page-link">
                  Open
                </Link>
              ) : null}
              {page.id ? (
                <button
                  type="button"
                  className="danger-button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await removePage(page.id)
                      setPages(result.pages)
                      setPage(emptyPage())
                      setMessage('Page deleted.')
                    })
                  }
                >
                  Delete
                </button>
              ) : null}
            </div>
            {message ? <p className="editor-message">{message}</p> : null}
          </section>
        </div>
      ) : null}

      {tab === 'site' ? (
        <section className="editor-compose editor-compose-wide">
          <label>
            Wordmark
            <input value={settings.wordmark} onChange={(event) => setSettings({ ...settings, wordmark: event.target.value })} />
          </label>
          <label>
            Browser title
            <input value={settings.site_title} onChange={(event) => setSettings({ ...settings, site_title: event.target.value })} />
          </label>
          <label>
            Description
            <input value={settings.site_description} onChange={(event) => setSettings({ ...settings, site_description: event.target.value })} />
          </label>
          <label>
            Eyebrow
            <input value={settings.eyebrow} onChange={(event) => setSettings({ ...settings, eyebrow: event.target.value })} />
          </label>
          <label>
            Hero line 1
            <input value={settings.hero_line1} onChange={(event) => setSettings({ ...settings, hero_line1: event.target.value })} />
          </label>
          <label>
            Hero line 2 (script)
            <input value={settings.hero_line2} onChange={(event) => setSettings({ ...settings, hero_line2: event.target.value })} />
          </label>
          <label>
            Hero line 3
            <input value={settings.hero_line3} onChange={(event) => setSettings({ ...settings, hero_line3: event.target.value })} />
          </label>
          <label>
            Hero note
            <textarea value={settings.hero_note} onChange={(event) => setSettings({ ...settings, hero_note: event.target.value })} rows={3} />
          </label>
          <label>
            About
            <textarea value={settings.about_content} onChange={(event) => setSettings({ ...settings, about_content: event.target.value })} rows={4} />
          </label>
          <label>
            Now
            <textarea value={settings.now_content} onChange={(event) => setSettings({ ...settings, now_content: event.target.value })} rows={4} />
          </label>
          <label>
            Footer left
            <input value={settings.footer_left} onChange={(event) => setSettings({ ...settings, footer_left: event.target.value })} />
          </label>
          <label>
            Footer center
            <input value={settings.footer_center} onChange={(event) => setSettings({ ...settings, footer_center: event.target.value })} />
          </label>
          <fieldset className="toggle-row">
            <legend>Homepage sections</legend>
            {(
              [
                ['show_archive', 'Archive'],
                ['show_about', 'About'],
                ['show_now', 'Now'],
                ['show_search', 'Search'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="check-label">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="editor-actions">
            <button type="button" disabled={pending} onClick={persistSettings}>
              {pending ? 'Saving…' : 'Save details'}
            </button>
          </div>
          {message ? <p className="editor-message">{message}</p> : null}
        </section>
      ) : null}

      {tab === 'look' ? (
        <section className="editor-compose editor-compose-wide">
          <p className="editor-message">Colors apply to the public site. Visitors can still switch light and dark.</p>
          <div className="palette-grid">
            {(['light', 'dark'] as const).map((mode) => (
              <div key={mode} className="palette-card">
                <div className="section-heading">
                  <span>{mode} theme</span>
                </div>
                {(
                  [
                    ['background', 'Background'],
                    ['foreground', 'Text'],
                    ['muted', 'Muted'],
                    ['border', 'Border'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="color-field">
                    {label}
                    <span>
                      <input
                        type="color"
                        value={settings.appearance[mode][key]}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              [mode]: { ...settings.appearance[mode], [key]: event.target.value },
                            },
                          })
                        }
                      />
                      <input
                        value={settings.appearance[mode][key]}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              [mode]: { ...settings.appearance[mode], [key]: event.target.value },
                            },
                          })
                        }
                      />
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="editor-actions">
            <button type="button" disabled={pending} onClick={persistSettings}>
              {pending ? 'Saving…' : 'Save look'}
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={pending}
              onClick={() => setSettings({ ...settings, appearance: defaultAppearance })}
            >
              Reset colors
            </button>
          </div>
          {message ? <p className="editor-message">{message}</p> : null}
        </section>
      ) : null}
    </div>
  )
}
