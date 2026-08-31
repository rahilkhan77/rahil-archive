'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/editor/actions'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action}>
      <label>
        Email
        <input type="email" name="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      {state?.error ? <p className="editor-message">{state.error}</p> : null}
    </form>
  )
}
