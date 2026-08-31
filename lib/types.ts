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

export type SitePage = {
  id: string
  slug: string
  title: string
  nav_label: string
  excerpt: string | null
  content: string
  date: string
  status: 'published' | 'draft'
  media: MediaItem[]
}

export type Palette = {
  background: string
  foreground: string
  muted: string
  border: string
}

export type Appearance = {
  light: Palette
  dark: Palette
}

export type Settings = {
  wordmark: string
  site_title: string
  site_description: string
  eyebrow: string
  hero_line1: string
  hero_line2: string
  hero_line3: string
  hero_note: string
  about_content: string
  now_content: string
  footer_left: string
  footer_center: string
  show_archive: boolean
  show_about: boolean
  show_now: boolean
  show_search: boolean
  appearance: Appearance
}

export type ArchiveData = {
  posts: Post[]
  pages: SitePage[]
  settings: Settings
}

export function mediaToken(id: string) {
  return `[[media:${id}]]`
}

export const RESERVED_SLUGS = new Set(['editor', 'api', 'auth', 'uploads', 'favicon.ico'])
