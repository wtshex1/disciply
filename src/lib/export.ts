import { db } from '../db'
import { isTauri } from '@tauri-apps/api/core'

export interface ExportPayload {
  app: 'disciply'
  type: 'full-export'
  exportedAt: string
  database: Record<string, unknown[]>
  localStorage: Record<string, string>
}

export async function collectAllData(): Promise<ExportPayload> {
  const database: Record<string, unknown[]> = {}
  await db.transaction('r', db.tables, async () => {
    for (const table of db.tables) {
      database[table.name] = await table.toArray()
    }
  })
  const localStorageData: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) localStorageData[key] = localStorage.getItem(key) ?? ''
  }
  return {
    app: 'disciply',
    type: 'full-export',
    exportedAt: new Date().toISOString(),
    database,
    localStorage: localStorageData
  }
}

export function downloadJson(filename: string, payload: ExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function exportAllData(): Promise<boolean> {
  try {
    const payload = await collectAllData()
    const stamp = new Date().toISOString().slice(0, 10)
    const filename = `disciply-backup-${stamp}.json`
    const json = JSON.stringify(payload, null, 2)

    const inTauri = isTauri()
    if (!inTauri) {
      downloadJson(filename, payload)
      return true
    }

    const [{ save }, { writeTextFile }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs')
    ])
    const dest = await save({
      defaultPath: filename,
      filters: [{ name: 'Disciply backup', extensions: ['json'] }]
    })
    if (!dest) return true
    await writeTextFile(dest, json)
    return true
  } catch (e) {
    console.error('export failed', e)
    return false
  }
}