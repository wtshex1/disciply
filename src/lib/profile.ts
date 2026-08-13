import { useSyncExternalStore } from 'react'

const PROFILE_KEY = 'disciply-profile'
const PROFILE_IMG_SIZE = 256
export const DEFAULT_NAME = 'Alex Rider'

export interface Profile {
  name?: string
  quote?: string
  photo?: string
  result?: { overall: number; vals: number[] }
}

export function loadProfile(): Profile | null {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')
  } catch (e) {
    return null
  }
}

export function profileName(): string {
  const p = loadProfile()
  return p && p.name ? p.name : DEFAULT_NAME
}

export function profilePhoto(): string | null {
  const p = loadProfile()
  return p && p.photo ? p.photo : null
}

export function profileQuote(): string {
  const p = loadProfile()
  return p && p.quote ? p.quote : ''
}

export function persistProfile(profile: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch (e) {}
  notify()
}

export function profileResult(): Profile['result'] | null {
  const p = loadProfile()
  return p && p.result ? p.result : null
}

export function saveQuizResult(result: { overall: number; vals: number[] }) {
  const p = loadProfile() || {}
  persistProfile({ ...p, result })
}

export function removeProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch (e) {}
  notify()
}

const listeners = new Set<() => void>()
let snapshot: Profile | null = loadProfile()

function notify() {
  snapshot = loadProfile()
  listeners.forEach(f => f())
}

export function getProfileSnapshot(): Profile | null {
  return snapshot
}

export function onProfileChange(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function useProfile() {
  return useSyncExternalStore(cb => onProfileChange(cb), getProfileSnapshot)
}

export function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const size = PROFILE_IMG_SIZE
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no ctx'))
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
