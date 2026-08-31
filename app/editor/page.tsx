import Link from 'next/link'
import { getAllPosts, getSettings } from '@/lib/archive'
import { getEditorSession } from '@/lib/auth'
import { LoginForm } from '@/app/editor/login-form'
import { EditorStudio } from '@/app/editor/studio'

export default async function EditorPage() {
  const session = await getEditorSession()

  if (!session) {
    return (
      <main className="editor-page">
        <Link href="/" className="wordmark">
          RahilArchive
        </Link>
        <div className="editor-box">
          <p className="eyebrow">Private editor</p>
          <h1>
            Keep the archive
            <br />
            <em>close at hand.</em>
          </h1>
          <LoginForm />
          <p className="editor-foot">Write, edit, and publish from one quiet place.</p>
        </div>
      </main>
    )
  }

  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()])

  return (
    <main className="editor-page editor-page-wide">
      <Link href="/" className="wordmark">
        RahilArchive
      </Link>
      <EditorStudio email={session.email} initialPosts={posts} initialSettings={settings} />
    </main>
  )
}
