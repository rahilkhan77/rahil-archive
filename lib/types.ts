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
}

export type Settings = {
  about_content: string
  now_content: string
}

export type ArchiveData = {
  posts: Post[]
  settings: Settings
}
