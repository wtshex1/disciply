import { useSyncExternalStore } from 'react'
import { lang, onLangChange } from '../i18n'

export type Lang = 'en' | 'ro'

export function useLang(): Lang {
  return useSyncExternalStore(
    cb => onLangChange(cb),
    () => lang
  )
}
