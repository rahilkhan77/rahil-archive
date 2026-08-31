'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { deletePost, updateSettings, upsertPost } from '@/lib/archive'
import { createSession, destroySession, getEditorSession, verifyCredentials } from '@/lib/auth'
import type { Post, Settings } from '@/lib/types'

async function requireEditor() {
  const session = await getEditorSession()
  if (!session) throw new Error('Unauthorized')
  return session
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
    revalidatePath('/')
    revalidatePath('/editor')
    return { ok: true as const, posts: archive.posts, post }
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : 'Could not save.' }
  }
}

export async function removePost(id: string) {
  await requireEditor()
  const archive = await deletePost(id)
  revalidatePath('/')
  revalidatePath('/editor')
  return { posts: archive.posts }
}

export async function saveSettings(settings: Settings) {
  await requireEditor()
  const archive = await updateSettings(settings)
  revalidatePath('/')
  revalidatePath('/editor')
  return { settings: archive.settings }
}
