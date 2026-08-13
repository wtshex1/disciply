import { LUCIDE } from './lucide'

export const GOAL_ICONS: { key: string; icon: React.ReactNode }[] = [
  {
    key: 'target',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/></svg>
  },
  {
    key: 'star',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l2.7 6.1 6.6.6-5 4.4 1.5 6.4L12 16.6l-5.8 3.4 1.5-6.4-5-4.4 6.6-.6L12 2.5z"/></svg>
  },
  {
    key: 'flag',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4c3-1.5 6 1.5 9 0s6 1.5 9 0v11c-3 1.5-6-1.5-9 0s-6-1.5-9 0"/></svg>
  },
  {
    key: 'book',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
  },
  {
    key: 'brain',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3A2.5 2.5 0 0 0 7 5.5v.6A3 3 0 0 0 4 9v2a3 3 0 0 0 3 3c0 1.9 1.6 3.4 3.5 3.4.5 0 1-.1 1.5-.3v4.4a1.5 1.5 0 0 0 3 0v-7.6A3 3 0 0 0 16 9V7.5A2.5 2.5 0 0 0 13.5 5c-1 0-1.8.5-2.4 1.3A3.4 3.4 0 0 0 9.5 3z"/></svg>
  },
  {
    key: 'dumbbell',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 9.5v5M4 8v8M20 8v8M22 9.5v5M4 12h16"/></svg>
  },
  {
    key: 'heart',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9z"/></svg>
  },
  {
    key: 'trophy',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M7 6H4a2 2 0 0 0 2 4h1M17 6h3a2 2 0 0 1-2 4h-1"/></svg>
  },
  {
    key: 'money',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5"/></svg>
  },
  {
    key: 'clock',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  }
]

export function goalIcon(key: string): React.ReactNode {
  const lu = LUCIDE.find(i => i.n === key)
  if (lu) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: lu.d }} />
    )
  }
  return (GOAL_ICONS.find(i => i.key === key) || GOAL_ICONS[0]).icon
}
