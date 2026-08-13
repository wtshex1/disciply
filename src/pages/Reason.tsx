import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { db, type GoalItem } from '../db'
import { goalIcon } from '../lib/icons'
import type { View } from '../App'

export default function Reason({ id, from, setView }: { id: number; from?: 'home' | 'progress'; setView: (v: View) => void }) {
  const [goal, setGoal] = useState<GoalItem | null>(null)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    const g = await db.goals.get(id)
    setGoal(g || null)
    if (g && g.blockedReason) setText(g.blockedReason)
  }, [id])

  useEffect(() => { void reload() }, [reload])

  const save = async () => {
    if (!goal || goal.id == null || !text.trim() || saving) return
    setSaving(true)
    await db.goals.update(goal.id, { blocked: true, done: false, blockedReason: text.trim() })
    setSaving(false)
    setView({ page: from === 'progress' ? 'progress' : 'home' })
  }

  const clear = async () => {
    if (!goal || goal.id == null) return
    await db.goals.update(goal.id, { blocked: false, blockedReason: undefined })
    setView({ page: from === 'progress' ? 'progress' : 'home' })
  }

  return (
    <div className="page-content active" id="page-reason" data-od-id="screen-reason">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: from === 'progress' ? 'progress' : 'home' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      {!goal ? (
        <div className="card glass-card empty-state">
          <div className="more-icon big">{goalIcon('target')}</div>
          <h3 style={{ margin: '0 0 6px' }}>{t('od-no-data')}</h3>
        </div>
      ) : (
        <>
          <div className="sub-hero glass-card">
            <div className="more-icon big">{goalIcon(goal.icon)}</div>
            <h3>{goal.name}</h3>
            <p className="u-muted13" style={{ lineHeight: 1.5 }}>{t('reason-hint')}</p>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('reason-title')}</div>
            <textarea
              className="glass-input"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('reason-ph')}
              autoFocus
              style={{ width: '100%', marginBottom: 14, resize: 'none', lineHeight: 1.55 }}
            />
            <button className="hyd-btn" onClick={() => void save()} disabled={!text.trim() || saving} style={{ opacity: text.trim() ? 1 : 0.5 }}>
              {saving ? '…' : t('add-save')}
            </button>
            {goal.blocked && !!goal.blockedReason && (
              <button className="hyd-btn alt" style={{ marginTop: 10 }} onClick={() => void clear()}>
                {t('reason-clear')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}