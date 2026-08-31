export type MediaKind = 'image' | 'video' | 'file'

export type MediaItem = {
  id: string
  kind: MediaKind
  url: string
  name: string
  mime: string
}

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  date: string
  status: 'published' | 'draft'
  location: string | null
  mood: string | null
  media: MediaItem[]
}

export type Settings = {
  about_content: string
  now_content: string
}

export type ArchiveData = {
  posts: Post[]
  settings: Settings
}

export function mediaToken(id: string) {
  return `[[media:${id}]]`
}
