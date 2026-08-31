import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'rahil_editor'
const THIRTY_DAYS = 60 * 60 * 24 * 30

function sessionSecret() {
  const secret = process.env.EDITOR_SESSION_SECRET
  if (!secret) throw new Error('EDITOR_SESSION_SECRET is not set')
  return secret
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex')
}

function hashesMatch(a: string, b: string) {
  const left = createHmac('sha256', sessionSecret()).update(a).digest()
  const right = createHmac('sha256', sessionSecret()).update(b).digest()
  return timingSafeEqual(left, right)
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.EDITOR_EMAIL ?? ''
  const expectedPassword = process.env.EDITOR_PASSWORD ?? ''
  return hashesMatch(email, expectedEmail) && hashesMatch(password, expectedPassword)
}

export async function createSession(email: string) {
  const payload = `${email}|${Date.now() + THIRTY_DAYS * 1000}`
  const token = `${payload}.${sign(payload)}`
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS,
  })
}

export async function getEditorSession() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null

  const splitAt = token.lastIndexOf('.')
  if (splitAt <= 0) return null
  const payload = token.slice(0, splitAt)
  const signature = token.slice(splitAt + 1)
  if (!timingSafeHex(sign(payload), signature)) return null

  const [email, expiry] = payload.split('|')
  if (!email || Number(expiry) < Date.now()) return null
  if (!hashesMatch(email, process.env.EDITOR_EMAIL ?? '')) return null
  return { email }
}

function timingSafeHex(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function destroySession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
