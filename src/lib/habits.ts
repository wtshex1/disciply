import { useEffect, useState } from 'react'

const KEY = 'disciply-habits'
const EVT = 'disciply-habits'

export function getHabits(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function isHabit(id: string): boolean {
  return getHabits().includes(id)
}

export function toggleHabit(id: string) {
  const cur = getHabits()
  const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVT))
}

export function useHabits(): string[] {
  const [habits, setHabits] = useState<string[]>(getHabits)
  useEffect(() => {
    const fn = () => setHabits(getHabits())
    window.addEventListener(EVT, fn)
    return () => window.removeEventListener(EVT, fn)
  }, [])
  return habits
}
