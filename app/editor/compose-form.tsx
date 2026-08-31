'use client'

import { useRef } from 'react'
import { FileText, Image as ImageIcon, Video, X } from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { insertMediaToken } from '@/components/entry-body'
import type { MediaItem, MediaKind } from '@/lib/types'

function kindFromFile(file: File): MediaKind {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'file'
}

const acceptByKind: Record<MediaKind, string> = {
  image: 'image/*',
  video: 'video/*',
  file: '*/*',
}

export type DraftFields = {
  title: string
  excerpt: string
  content: string
  date: string
  media: MediaItem[]
}

export function ComposeFields({
  draft,
  setDraft,
  useBlob,
  extra,
  onMessage,
  uploading,
  setUploading,
}: {
  draft: DraftFields
  setDraft: (next: DraftFields) => void
  useBlob: boolean
  extra?: React.ReactNode
  onMessage: (value: string) => void
  uploading: boolean
  setUploading: (value: boolean) => void
}) {
  const writingRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingKind = useRef<MediaKind>('image')

  const openPicker = (kind: MediaKind) => {
    pendingKind.current = kind
    if (fileRef.current) {
      fileRef.current.accept = acceptByKind[kind]
      fileRef.current.value = ''
      fileRef.current.click()
    }
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    onMessage(`Uploading ${file.name}…`)
    try {
      let url = ''
      if (useBlob) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        url = blob.url
      } else {
        const form = new FormData()
        form.append('file', file)
        const response = await fetch('/api/upload', { method: 'POST', body: form })
        const payload = (await response.json()) as { url?: string; error?: string }
        if (!response.ok || !payload.url) throw new Error(payload.error || 'Upload failed.')
        url = payload.url
      }
      const item: MediaItem = {
        id: crypto.randomUUID(),
        kind: kindFromFile(file),
        url,
        name: file.name,
        mime: file.type || 'application/octet-stream',
      }
      const cursor = writingRef.current?.selectionStart
      setDraft({
        ...draft,
        media: [...draft.media, item],
        content: insertMediaToken(draft.content, item.id, cursor),
      })
      onMessage(`${file.name} added.`)
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <label>
        Title
        <input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          placeholder="Title"
        />
      </label>
      {extra}
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
          value={draft.excerpt}
          onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
          placeholder="One quiet line"
        />
      </label>
      <label>
        Writing
        <textarea
          ref={writingRef}
          value={draft.content}
          onChange={(event) => setDraft({ ...draft, content: event.target.value })}
          placeholder="Write here. Separate paragraphs with a blank line."
          rows={12}
        />
      </label>
      <div className="upload-row">
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadFile(file)
          }}
        />
        <button type="button" className="ghost-button" disabled={uploading} onClick={() => openPicker('image')}>
          <ImageIcon size={14} strokeWidth={1.5} /> Image
        </button>
        <button type="button" className="ghost-button" disabled={uploading} onClick={() => openPicker('video')}>
          <Video size={14} strokeWidth={1.5} /> Video
        </button>
        <button type="button" className="ghost-button" disabled={uploading} onClick={() => openPicker('file')}>
          <FileText size={14} strokeWidth={1.5} /> File
        </button>
      </div>
      {draft.media.length > 0 ? (
        <ul className="media-chips">
          {draft.media.map((item) => (
            <li key={item.id}>
              <span>
                {item.kind}: {item.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    media: draft.media.filter((entry) => entry.id !== item.id),
                    content: draft.content.replaceAll(`[[media:${item.id}]]`, '').replace(/\n{3,}/g, '\n\n'),
                  })
                }
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
