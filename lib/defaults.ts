import type { Appearance, Settings } from '@/lib/types'

export const defaultAppearance: Appearance = {
  light: {
    background: '#faf9f6',
    foreground: '#171715',
    muted: '#77736c',
    border: '#e4e1da',
  },
  dark: {
    background: '#12110f',
    foreground: '#f3f0e8',
    muted: '#9a958c',
    border: '#2e2c28',
  },
}

export const defaultSettings: Settings = {
  wordmark: 'RahilArchive',
  site_title: 'RahilArchive — A living archive',
  site_description: 'An archive of what I build, think, learn, and live.',
  eyebrow: 'A living archive · est. 2026',
  hero_line1: 'Things I build,',
  hero_line2: 'think, learn,',
  hero_line3: 'and live.',
  hero_note: 'A quiet place for the work, questions, failures, and ordinary days worth keeping.',
  about_content: 'I am Rahil. This is a living archive of the work, questions, and moments I want to keep.',
  now_content: 'Building thoughtful products, learning in public, and making room for the long view.',
  footer_left: 'RahilArchive',
  footer_center: 'Made slowly, kept forever.',
  show_archive: true,
  show_about: true,
  show_now: true,
  show_search: true,
  appearance: defaultAppearance,
}
