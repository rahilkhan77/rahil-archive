import { getPublishedPages, getPublishedPosts, getSettings } from '@/lib/archive'
import { ArchiveHome } from '@/app/archive-home'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [posts, pages, settings] = await Promise.all([getPublishedPosts(), getPublishedPages(), getSettings()])
  return <ArchiveHome posts={posts} pages={pages} settings={settings} />
}
