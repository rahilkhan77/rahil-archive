import { FileText } from 'lucide-react'
import type { MediaItem } from '@/lib/types'
import { mediaToken } from '@/lib/types'

export function MediaEmbed({ item }: { item: MediaItem }) {
  if (item.kind === 'image') {
    return (
      <figure className="media-embed">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.name} />
        <figcaption>{item.name}</figcaption>
      </figure>
    )
  }

  if (item.kind === 'video') {
    return (
      <figure className="media-embed">
        <video src={item.url} controls playsInline preload="metadata" />
        <figcaption>{item.name}</figcaption>
      </figure>
    )
  }

  return (
    <a className="file-embed" href={item.url} target="_blank" rel="noreferrer">
      <FileText size={16} strokeWidth={1.4} />
      <span>{item.name}</span>
    </a>
  )
}

export function EntryBody({ content, media }: { content: string; media: MediaItem[] }) {
  const blocks = content.split(/\n\n+/).filter((block) => block.trim())
  return (
    <div className="script-reading">
      {blocks.map((block, index) => {
        const match = block.trim().match(/^\[\[media:(.+)\]\]$/)
        if (match) {
          const item = media.find((entry) => entry.id === match[1])
          return item ? <MediaEmbed key={`${item.id}-${index}`} item={item} /> : null
        }
        return <p key={index}>{block}</p>
      })}
    </div>
  )
}

export function insertMediaToken(content: string, id: string, cursor?: number) {
  const token = `\n\n${mediaToken(id)}\n\n`
  if (cursor == null || cursor < 0) return `${content.trim()}${token}`
  return `${content.slice(0, cursor)}${token}${content.slice(cursor)}`
}
