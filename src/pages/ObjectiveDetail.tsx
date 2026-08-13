import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n'
import { useLang } from '../lib/useLang'
import { db, type GoalItem } from '../db'
import { capitalize } from '../lib/date'
import { goalIcon } from '../lib/icons'
import { CATEGORIES, catName } from '../questions'
import type { View } from '../App'

export default function ObjectiveDetail({ id, from, setView }: { id: number; from?: 'home' | 'progress'; setView: (v: View) => void }) {
  const lang = useLang()
  const [goal, setGoal] = useState<GoalItem | null>(null)

  const reload = useCallback(async () => {
    const g = await db.goals.get(id)
    setGoal(g || null)
  }, [id])

  useEffect(() => { void reload() }, [reload])

  const locale = lang === 'ro' ? 'ro-RO' : 'en-US'
  const now = new Date()
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const created = goal ? new Date(goal.createdAt) : null
  const created0 = created ? new Date(created.getFullYear(), created.getMonth(), created.getDate()) : null
  const deadline = goal && goal.deadline ? new Date(goal.deadline.slice(0, 10) + 'T00:00:00') : null
  const deadline0 = deadline ? new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate()) : null

  const status: 'done' | 'overdue' | 'active' | 'pending' = !goal ? 'active'
    : goal.done ? 'done'
    : goal.blocked ? 'pending'
    : deadline0 && deadline0.getTime() < today0.getTime() ? 'overdue'
    : 'active'

  const diffDays = deadline0 ? Math.round((deadline0.getTime() - today0.getTime()) / 86400000) : null
  const startT = created0 ? created0.getTime() : today0.getTime()
  const endT = deadline0 ? deadline0.getTime() : startT
  const timelinePct = endT > startT
    ? Math.min(100, Math.max(0, Math.round((today0.getTime() - startT) / (endT - startT) * 100)))
    : 100

  const cat = goal ? CATEGORIES.find(c => c.key === goal.area) : null

  const fmtDate = (d: Date) => capitalize(d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }))

  const statusVal = status === 'done' ? t('od-done')
    : status === 'pending' ? t('od-pending')
    : status === 'overdue' ? t('od-overdue')
    : t('od-active')
  const statusCls = status === 'done' ? 'ok' : status === 'overdue' ? 'bad' : status === 'pending' ? 'warn' : 'on'

  const daysVal = goal && goal.done ? '✓'
    : diffDays == null ? '—'
    : diffDays >= 0 ? '+' + diffDays
    : String(diffDays)
  const daysLabel = goal && goal.done ? t('od-completed')
    : diffDays == null ? t('od-no-deadline')
    : diffDays >= 0 ? t('od-days-left')
    : t('od-days-over')

  const toggleDone = async () => {
    if (!goal || goal.id == null) return
    await db.goals.update(goal.id, goal.done
      ? { done: false }
      : { done: true, blocked: false, blockedReason: undefined })
    await reload()
  }

  return (
    <div className="page-content active" id="page-objective" data-od-id="screen-objective">
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: from === 'progress' ? 'progress' : 'home' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>

      {!goal ? (
        <div className="card glass-card empty-state">
          <div className="more-icon big">{goalIcon('target')}</div>
          <h3 style={{ margin: '0 0 6px' }}>{t('od-no-data')}</h3>
          <p className="u-muted13" style={{ textAlign: 'center', lineHeight: 1.5 }}>{t('od-no-data-sub')}</p>
        </div>
      ) : (
        <>
          <div className="sub-hero glass-card">
            <div className="more-icon big" style={{ color: cat ? cat.color : 'var(--accent)' }}>{goalIcon(goal.icon)}</div>
            <h3>{goal.name}</h3>
            {goal.desc && <p className="u-muted13">{goal.desc}</p>}
            {goal.blocked && !!goal.blockedReason && <span className="reason-chip" style={{ alignSelf: 'center' }}>{goal.blockedReason}</span>}
          </div>

          <div className="card glass-card">
            <div className="hd-stats">
              <div className="hd-stat">
                <span className={'hd-stat-val ' + statusCls}>{statusVal}</span>
                <span className="hd-stat-label">{t('od-status')}</span>
              </div>
              <div className="hd-stat">
                <span className={'hd-stat-val' + (status === 'overdue' ? ' bad' : '')}>{daysVal}<small>{t('od-days-unit')}</small></span>
                <span className="hd-stat-label">{daysLabel}</span>
              </div>
              <div className="hd-stat">
                <span className="hd-stat-val small"><span className={'goal-term t' + (goal.term || 'medium')}>{t('term-' + (goal.term || 'medium'))}</span></span>
                <span className="hd-stat-label">{t('od-term')}</span>
              </div>
              <div className="hd-stat">
                <span className="hd-stat-val small" style={{ color: cat ? cat.color : 'var(--text-muted)' }}>{cat ? catName(cat) : '—'}</span>
                <span className="hd-stat-label">{t('od-area')}</span>
              </div>
            </div>
          </div>

          <div className="card glass-card">
            <div className="u-section-h">{t('od-timeline')}</div>
            {deadline0 ? (
              <>
                <div className="hd-tl">
                  <div className="hd-tl-bar">
                    <span className="hd-tl-marker" style={{ left: timelinePct + '%' }}></span>
                  </div>
                  <div className="hd-tl-labels">
                    <span>{created0 ? fmtDate(created0) : '—'}</span>
                    <span className="u-muted13">{t('od-today')}</span>
                    <span>{fmtDate(deadline0)}</span>
                  </div>
                </div>
                <p className="u-muted13" style={{ textAlign: 'center', marginTop: 10 }}>
                  {status === 'done'
                    ? t('od-time-done').replace('{0}', String(timelinePct))
                    : timelinePct >= 100
                      ? t('od-time-over')
                      : t('od-time-used').replace('{0}', String(timelinePct)).replace('{1}', String(100 - timelinePct))}
                </p>
                {goal.deadline && goal.deadline.length > 10 && (
                  <p className="u-muted13" style={{ textAlign: 'center' }}>
                    {t('od-at')} {goal.deadline.slice(11, 16)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="u-muted13" style={{ textAlign: 'center', marginBottom: 6 }}>{t('od-no-deadline')}</p>
                <div className="hd-tl">
                  <div className="hd-tl-bar"><span className="hd-tl-marker" style={{ left: '100%' }}></span></div>
                  <div className="hd-tl-labels" style={{ gridTemplateColumns: '1fr' }}>
                    <span>{t('od-created')} · {created0 ? fmtDate(created0) : '—'}</span>
                  </div>
                </div>
              </>
            )}
            <button className={'hyd-btn' + (goal.done ? ' alt' : '')} style={{ marginTop: 16 }} onClick={() => void toggleDone()}>
              {goal.done ? t('od-undo') : t('od-mark-done')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}