export const DARK_KEY = 'disciply-dark'

function storedDark() {
  try {
    const v = localStorage.getItem(DARK_KEY)
    if (v === '1') return true
    if (v === '0') return false
  } catch (e) {}
  return null
}

function systemDark() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch (e) {
    return false
  }
}

export function isDark() {
  const s = storedDark()
  return s !== null ? s : false
}

function updateDarkSwitch() {
  const sw = document.getElementById('darkSwitch')
  if (sw) sw.classList.toggle('on', isDark())
}

export function applyBodyClasses() {
  const dark = isDark()
  document.body.classList.toggle('dark', dark)
  document.body.classList.toggle('light', !dark)
}

export function applyDark() {
  document.documentElement.classList.toggle('dark', isDark())
  if (document.body) applyBodyClasses()
  updateDarkSwitch()
}

export function toggleDark() {
  try {
    localStorage.setItem(DARK_KEY, isDark() ? '0' : '1')
  } catch (e) {}
  applyDark()
}

applyDark()
