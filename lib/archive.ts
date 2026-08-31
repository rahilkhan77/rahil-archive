import { promises as fs } from 'fs'
import path from 'path'
import { put, list } from '@vercel/blob'
import { defaultAppearance, defaultSettings } from '@/lib/defaults'
import type { ArchiveData, Post, Settings, SitePage } from '@/lib/types'
import { RESERVED_SLUGS } from '@/lib/types'

const filePath = path.join(process.cwd(), 'data', 'archive.json')
const blobPath = 'cms/archive.json'
const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

let writeChain = Promise.resolve()

function mergePalette(base: Settings['appearance']['light'], value?: Partial<Settings['appearance']['light']>) {
  return { ...base, ...value }
}

export function normalizeArchive(raw: Partial<ArchiveData> & { posts?: Post[]; settings?: Partial<Settings> }): ArchiveData {
  const appearance = {
    light: mergePalette(defaultAppearance.light, raw.settings?.appearance?.light),
    dark: mergePalette(defaultAppearance.dark, raw.settings?.appearance?.dark),
  }
  return {
    posts: (raw.posts ?? []).map((post) => ({
      ...post,
      media: Array.isArray(post.media) ? post.media : [],
    })),
    pages: (raw.pages ?? []).map((page) => ({
      ...page,
      nav_label: page.nav_label || page.title,
      media: Array.isArray(page.media) ? page.media : [],
    })),
    settings: {
      ...defaultSettings,
      ...raw.settings,
      appearance,
      show_archive: raw.settings?.show_archive ?? defaultSettings.show_archive,
      show_about: raw.settings?.show_about ?? defaultSettings.show_about,
      show_now: raw.settings?.show_now ?? defaultSettings.show_now,
      show_search: raw.settings?.show_search ?? defaultSettings.show_search,
    },
  }
}

async function readLocal(): Promise<ArchiveData> {
  const raw = await fs.readFile(filePath, 'utf8')
  return normalizeArchive(JSON.parse(raw) as Partial<ArchiveData>)
}

export async function readArchive(): Promise<ArchiveData> {
  if (hasBlob()) {
    try {
      const { blobs } = await list({ prefix: blobPath })
      const file = blobs.find((blob) => blob.pathname === blobPath) ?? blobs[0]
      if (file) {
        const response = await fetch(file.url, { cache: 'no-store' })
        if (response.ok) return normalizeArchive((await response.json()) as Partial<ArchiveData>)
      }
    } catch {
      // Fall through to the local seed file.
    }
  }
  return readLocal()
}

async function writeArchive(data: ArchiveData) {
  const payload = `${JSON.stringify(data, null, 2)}\n`
  const next = writeChain.then(async () => {
    try {
      await fs.writeFile(filePath, payload, 'utf8')
    } catch {
      // Read-only on Vercel; Blob is the source of truth there.
    }
    if (hasBlob()) {
      await put(blobPath, payload, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
      })
    }
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

export async function getAllPages(): Promise<SitePage[]> {
  const archive = await readArchive()
  return [...archive.pages]
}

export async function getPublishedPages(): Promise<SitePage[]> {
  const archive = await readArchive()
  return archive.pages.filter((page) => page.status === 'published')
}

export async function getPublishedPage(slug: string): Promise<SitePage | null> {
  const archive = await readArchive()
  return archive.pages.find((page) => page.slug === slug && page.status === 'published') ?? null
}

export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'entry'
}

function uniqueSlug(archive: ArchiveData, title: string, currentId?: string) {
  const base = slugify(title)
  const taken = new Set([
    ...RESERVED_SLUGS,
    ...archive.posts.filter((post) => post.id !== currentId).map((post) => post.slug),
    ...archive.pages.filter((page) => page.id !== currentId).map((page) => page.slug),
  ])
  let slug = base
  let i = 2
  while (taken.has(slug)) {
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
      slug: uniqueSlug(archive, title, input.id),
      media,
    }
  } else {
    archive.posts.unshift({
      id: crypto.randomUUID(),
      slug: uniqueSlug(archive, title),
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

export async function upsertPage(input: {
  id?: string
  title: string
  slug?: string
  nav_label: string
  excerpt: string
  content: string
  date: string
  status: SitePage['status']
  media?: SitePage['media']
}) {
  const archive = await readArchive()
  const title = input.title.trim()
  if (!title) throw new Error('Title is required.')
  const content = input.content.trim()
  if (!content) throw new Error('Write a little before publishing.')
  const date = input.date || new Date().toISOString().slice(0, 10)
  const excerpt = input.excerpt.trim() || null
  const media = input.media ?? []
  const nav_label = input.nav_label.trim() || title
  const slugSource = input.slug?.trim() || title

  if (input.id) {
    const index = archive.pages.findIndex((page) => page.id === input.id)
    if (index === -1) throw new Error('Page not found.')
    archive.pages[index] = {
      ...archive.pages[index],
      title,
      nav_label,
      excerpt,
      content,
      date,
      status: input.status,
      slug: uniqueSlug(archive, slugSource, input.id),
      media,
    }
  } else {
    archive.pages.push({
      id: crypto.randomUUID(),
      slug: uniqueSlug(archive, slugSource),
      title,
      nav_label,
      excerpt,
      content,
      date,
      status: input.status,
      media,
    })
  }

  await writeArchive(archive)
  const page = input.id
    ? archive.pages.find((entry) => entry.id === input.id)!
    : archive.pages[archive.pages.length - 1]
  return { archive, page }
}

export async function deletePage(id: string) {
  const archive = await readArchive()
  archive.pages = archive.pages.filter((page) => page.id !== id)
  await writeArchive(archive)
  return archive
}

export async function updateSettings(settings: Settings) {
  const archive = await readArchive()
  archive.settings = normalizeArchive({ ...archive, settings }).settings
  await writeArchive(archive)
  return archive
}
