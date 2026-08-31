'use client'

import { useMemo, useState, useTransition } from 'react'
import { removePost, savePost, saveSettings, signOut } from '@/app/editor/actions'
import type { Post, Settings } from '@/lib/types'

const emptyDraft = (): Omit<Post, 'slug' | 'location' | 'mood'> => ({
  id: '',
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'published',
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`),
  )
}

export function EditorStudio({
  email,
  initialPosts,
  initialSettings,
}: {
  email: string
  initialPosts: Post[]
  initialSettings: Settings
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [settings, setSettings] = useState(initialSettings)
  const [draft, setDraft] = useState(emptyDraft())
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const sorted = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  )

  const selectPost = (post: Post) => {
    setDraft({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content,
      date: post.date,
      status: post.status,
    })
    setMessage('')
  }

  const persist = (status: Post['status']) => {
    startTransition(async () => {
      const result = await savePost({
        id: draft.id || undefined,
        title: draft.title,
        excerpt: draft.excerpt ?? '',
        content: draft.content,
        date: draft.date,
        status,
      })
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setPosts(result.posts)
      setDraft({
        id: result.post.id,
        title: result.post.title,
        excerpt: result.post.excerpt ?? '',
        content: result.post.content,
        date: result.post.date,
        status: result.post.status,
      })
      setMessage(status === 'published' ? 'Published to the homepage.' : 'Saved as a draft.')
    })
  }

  const remove = () => {
    if (!draft.id) return
    startTransition(async () => {
      const result = await removePost(draft.id)
      setPosts(result.posts)
      setDraft(emptyDraft())
      setMessage('Entry removed.')
    })
  }

  const persistSettings = () => {
    startTransition(async () => {
      const result = await saveSettings(settings)
      setSettings(result.settings)
      setMessage('About and Now updated.')
    })
  }

  return (
    <div className="editor-studio">
      <header className="editor-toolbar">
        <div>
          <p className="eyebrow">Signed in as {email}</p>
          <h1>
            Write the next
            <br />
            <em>page.</em>
          </h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="ghost-button">
            Sign out
          </button>
        </form>
      </header>

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
              setDraft(emptyDraft())
              setMessage('')
            }}
          >
            New entry
          </button>
          {sorted.map((post) => (
            <button
              key={post.id}
              type="button"
              className={post.id === draft.id ? 'entry-chip is-active' : 'entry-chip'}
              onClick={() => selectPost(post)}
            >
              <strong>{post.title}</strong>
              <span>
                {formatDate(post.date)} · {post.status}
              </span>
            </button>
          ))}
        </aside>

        <section className="editor-compose">
          <label>
            Title
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="The title of this day"
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
          <label>
            Excerpt
            <input
              value={draft.excerpt ?? ''}
              onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
              placeholder="One quiet line for the homepage"
            />
          </label>
          <label>
            Writing
            <textarea
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
              placeholder="Write the entry here. Separate paragraphs with a blank line."
              rows={12}
            />
          </label>
          <div className="editor-actions">
            <button type="button" disabled={pending} onClick={() => persist('published')}>
              {pending ? 'Saving…' : 'Publish to homepage'}
            </button>
            <button type="button" className="ghost-button" disabled={pending} onClick={() => persist('draft')}>
              Save draft
            </button>
            {draft.id ? (
              <button type="button" className="danger-button" disabled={pending} onClick={remove}>
                Delete
              </button>
            ) : null}
          </div>
          {message ? <p className="editor-message">{message}</p> : null}

          <div className="editor-site">
            <div className="section-heading">
              <span>About & Now</span>
            </div>
            <label>
              About
              <textarea
                value={settings.about_content}
                onChange={(event) => setSettings({ ...settings, about_content: event.target.value })}
                rows={4}
              />
            </label>
            <label>
              Now
              <textarea
                value={settings.now_content}
                onChange={(event) => setSettings({ ...settings, now_content: event.target.value })}
                rows={4}
              />
            </label>
            <button type="button" className="ghost-button" disabled={pending} onClick={persistSettings}>
              Update homepage copy
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
