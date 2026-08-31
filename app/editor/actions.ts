'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deletePage, deletePost, updateSettings, upsertPage, upsertPost } from '@/lib/archive'
import { createSession, destroySession, getEditorSession, verifyCredentials } from '@/lib/auth'
import type { Post, Settings, SitePage } from '@/lib/types'

async function requireEditor() {
  const session = await getEditorSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

function refresh(paths: string[] = []) {
  revalidatePath('/')
  revalidatePath('/editor')
  for (const path of paths) revalidatePath(path)
}

export async function signIn(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!verifyCredentials(email, password)) {
    return { error: 'Invalid email or password.' }
  }
  await createSession(email)
  redirect('/editor')
}

export async function signOut() {
  await destroySession()
  redirect('/editor')
}

export async function savePost(input: {
  id?: string
  title: string
  excerpt: string
  content: string
  date: string
  status: Post['status']
  media: Post['media']
}) {
  await requireEditor()
  try {
    const { archive, post } = await upsertPost(input)
    refresh()
    return { ok: true as const, posts: archive.posts, post }
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : 'Could not save.' }
  }
}

export async function removePost(id: string) {
  await requireEditor()
  const archive = await deletePost(id)
  refresh()
  return { posts: archive.posts }
}

export async function savePage(input: {
  id?: string
  title: string
  slug?: string
  nav_label: string
  excerpt: string
  content: string
  date: string
  status: SitePage['status']
  media: SitePage['media']
}) {
  await requireEditor()
  try {
    const { archive, page } = await upsertPage(input)
    refresh([`/${page.slug}`])
    return { ok: true as const, pages: archive.pages, page }
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : 'Could not save.' }
  }
}

export async function removePage(id: string) {
  await requireEditor()
  const archive = await deletePage(id)
  refresh()
  return { pages: archive.pages }
}

export async function saveSettings(settings: Settings) {
  await requireEditor()
  const archive = await updateSettings(settings)
  refresh()
  return { settings: archive.settings }
}
