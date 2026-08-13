export const MODULES: { id: string; tag: string; icon: React.ReactNode }[] = [
  {
    id: 'workout',
    tag: 'tag-health',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 9.5v5M4 8v8M20 8v8M22 9.5v5M4 12h16"/></svg>
  },
  {
    id: 'nutrition',
    tag: 'tag-health',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20c4-6 8-9 12-11"/></svg>
  },
  {
    id: 'hydration',
    tag: 'tag-health',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>
  },
  {
    id: 'sleep',
    tag: 'tag-health',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
  },
  {
    id: 'clock',
    tag: 'tag-productivity',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  },
  {
    id: 'agenda',
    tag: 'tag-productivity',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
  },
  {
    id: 'facial',
    tag: 'tag-health',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="10" r="1.4"/><circle cx="15" cy="10" r="1.4"/><path d="M12 14.5c1.8 0 3.2 1 3.9 2.5M8.1 17c.7-1.5 2.1-2.5 3.9-2.5"/><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/></svg>
  }
]

export function moduleNameKey(id: string) {
  return 'more-' + id + (id === 'workout' || id === 'facial' ? 's' : '')
}

export function moduleDescKey(id: string) {
  return 'more-' + id + (id === 'workout' || id === 'facial' ? 's' : '') + '-desc'
}
