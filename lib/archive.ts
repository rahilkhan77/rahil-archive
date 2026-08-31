import { promises as fs } from 'fs'
import path from 'path'
import type { ArchiveData, Post, Settings } from '@/lib/types'

const filePath = path.join(process.cwd(), 'data', 'archive.json')

let writeChain = Promise.resolve()

export async function readArchive(): Promise<ArchiveData> {
  const raw = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(raw) as ArchiveData
  data.posts = data.posts.map((post) => ({
    ...post,
    media: Array.isArray(post.media) ? post.media : [],
  }))
  return data
}

async function writeArchive(data: ArchiveData) {
  const next = writeChain.then(async () => {
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  })
  writeChain = next.then(
    () => undefined,
    () => undefined,
  )
  await next
}

export async function getPublishedPosts(): Promise<Post[]> {
  const archive = await readArchive()
  return [...archive.posts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getSettings(): Promise<Settings> {
  const archive = await readArchive()
  return archive.settings
}

export async function getAllPosts(): Promise<Post[]> {
  const archive = await readArchive()
  return [...archive.posts].sort((a, b) => b.date.localeCompare(a.date))
}

export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'entry'
}

function uniqueSlug(posts: Post[], title: string, currentId?: string) {
  const base = slugify(title)
  let slug = base
  let i = 2
  while (posts.some((post) => post.slug === slug && post.id !== currentId)) {
    slug = `${base}-${i}`
    i += 1
  }
  return slug
}

export async function upsertPost(input: {
  id?: string
  title: string
  excerpt: string
  content: string
  date: string
  status: Post['status']
  media?: Post['media']
}) {
  const archive = await readArchive()
  const title = input.title.trim()
  if (!title) throw new Error('Title is required.')
  const content = input.content.trim()
  if (!content) throw new Error('Write a little before publishing.')

  const date = input.date || new Date().toISOString().slice(0, 10)
  const excerpt = input.excerpt.trim() || null
  const media = input.media ?? []

  if (input.id) {
    const index = archive.posts.findIndex((post) => post.id === input.id)
    if (index === -1) throw new Error('Entry not found.')
    archive.posts[index] = {
      ...archive.posts[index],
      title,
      excerpt,
      content,
      date,
      status: input.status,
      slug: uniqueSlug(archive.posts, title, input.id),
      media,
    }
  } else {
    archive.posts.unshift({
      id: crypto.randomUUID(),
      slug: uniqueSlug(archive.posts, title),
      title,
      excerpt,
      content,
      date,
      status: input.status,
      location: null,
      mood: null,
      media,
    })
  }

  await writeArchive(archive)
  const post = input.id
    ? archive.posts.find((entry) => entry.id === input.id)!
    : archive.posts[0]
  return { archive, post }
}

export async function deletePost(id: string) {
  const archive = await readArchive()
  archive.posts = archive.posts.filter((post) => post.id !== id)
  await writeArchive(archive)
  return archive
}

export async function updateSettings(settings: Settings) {
  const archive = await readArchive()
  archive.settings = {
    about_content: settings.about_content.trim(),
    now_content: settings.now_content.trim(),
  }
  await writeArchive(archive)
  return archive
}
