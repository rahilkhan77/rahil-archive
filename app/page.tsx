import { getPublishedPosts, getSettings } from '@/lib/archive'
import { ArchiveHome } from '@/app/archive-home'

export default async function Page() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSettings()])
  return <ArchiveHome posts={posts} settings={settings} />
}
