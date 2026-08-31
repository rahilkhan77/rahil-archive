import { notFound } from 'next/navigation'
import { getPublishedPage, getPublishedPages, getSettings } from '@/lib/archive'
import { RESERVED_SLUGS } from '@/lib/types'
import { EntryBody } from '@/components/entry-body'
import { SiteChrome } from '@/components/site-chrome'

export const dynamic = 'force-dynamic'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${value}T12:00:00`),
  )
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (RESERVED_SLUGS.has(slug)) notFound()
  const page = await getPublishedPage(slug)
  if (!page) notFound()
  const [pages, settings] = await Promise.all([getPublishedPages(), getSettings()])

  return (
    <SiteChrome settings={settings} pages={pages}>
      <article className="custom-page">
        <p className="eyebrow">{formatDate(page.date)}</p>
        <h1>{page.title}</h1>
        {page.excerpt ? <p className="hero-note">{page.excerpt}</p> : null}
        <EntryBody content={page.content} media={page.media ?? []} />
      </article>
    </SiteChrome>
  )
}
