import Link from 'next/link'
import { getAllPosts, getSettings } from '@/lib/archive'
import { getEditorSession } from '@/lib/auth'
import { LoginForm } from '@/app/editor/login-form'
import { EditorStudio } from '@/app/editor/studio'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function EditorPage() {
  const session = await getEditorSession()
  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

  if (!session) {
    return (
      <main className="editor-page">
        <div className="editor-topbar">
          <Link href="/" className="wordmark">
            RahilArchive
          </Link>
          <ThemeToggle />
        </div>
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
      <div className="editor-topbar">
        <Link href="/" className="wordmark">
          RahilArchive
        </Link>
        <ThemeToggle />
      </div>
      <EditorStudio email={session.email} initialPosts={posts} initialSettings={settings} useBlob={useBlob} />
    </main>
  )
}
