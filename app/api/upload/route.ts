import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getEditorSession } from '@/lib/auth'

export const runtime = 'nodejs'

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'upload'
}

export async function POST(request: Request) {
  const session = await getEditorSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in to upload.' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Choose a file first.' }, { status: 400 })
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File is larger than 100MB.' }, { status: 400 })
    }

    const filename = `${Date.now()}-${safeName(file.name)}`
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ url: `/uploads/${filename}`, pathname: filename })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Uploads are not configured yet.' }, { status: 503 })
  }

  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 100 * 1024 * 1024,
        allowOverwrite: false,
      }),
      onUploadCompleted: async () => undefined,
    })
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 400 },
    )
  }
}
