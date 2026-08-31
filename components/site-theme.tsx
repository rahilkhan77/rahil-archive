import type { Appearance } from '@/lib/types'

export function SiteTheme({ appearance }: { appearance: Appearance }) {
  const css = `html[data-theme='light'], :root {
  --background: ${appearance.light.background};
  --foreground: ${appearance.light.foreground};
  --muted: ${appearance.light.muted};
  --border: ${appearance.light.border};
}
html[data-theme='dark'] {
  --background: ${appearance.dark.background};
  --foreground: ${appearance.dark.foreground};
  --muted: ${appearance.dark.muted};
  --border: ${appearance.dark.border};
}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
