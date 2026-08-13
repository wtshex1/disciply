import type { ReactNode } from 'react'

export interface CalCell {
  key: string
  dayNum: number
  cls: string
  barPct: number
  label: string
  dots?: number
  onClick?: () => void
}

export function buildCells(
  first: Date,
  daysInMonth: number,
  lead: number,
  dayFor: (dayNum: number, key: string) => Omit<CalCell, 'dayNum' | 'key'>
): CalCell[] {
  const cells: CalCell[] = []
  for (let i = 0; i < 42; i++) {
    const dayNum = i - lead + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ key: 'e' + i, dayNum, cls: 'hyd-cal-cell other', barPct: 0, label: '' })
      continue
    }
    const key = first.getFullYear() + '-' + String(first.getMonth() + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0')
    cells.push({ key, dayNum, ...dayFor(dayNum, key) })
  }
  return cells
}

export function CalCard(props: {
  title: ReactNode
  locale: string
  offset: number
  setOffset: (n: number) => void
  cells: CalCell[]
  stats?: string
  mode?: 'bar' | 'dots'
  noNav?: boolean
  onCellClick?: (key: string) => void
}) {
  const first = new Date(new Date().getFullYear(), new Date().getMonth() + props.offset, 1)
  const weekHead = []
  {
    const base = new Date(first)
    base.setDate(base.getDate() - ((first.getDay() + 6) % 7))
    for (let i = 0; i < 7; i++) {
      const wd = new Date(base)
      wd.setDate(base.getDate() + i)
      weekHead.push(<span key={i}>{wd.toLocaleDateString(props.locale, { weekday: 'narrow' })}</span>)
    }
  }
  const mode = props.mode || 'bar'

  return (
    <div className="card glass-card">
      <div className={'hyd-cal-head' + (props.noNav ? ' no-nav' : '')}>
        {!props.noNav && (
          <button className="hyd-reset" onClick={() => props.setOffset(props.offset - 1)} aria-label="Previous month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <div className="hyd-cal-title">{props.title}</div>
        {!props.noNav && (
          <button className="hyd-reset" onClick={() => props.setOffset(props.offset + 1)} aria-label="Next month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )}
      </div>
      <div className="hyd-cal-week">{weekHead}</div>
      <div className="hyd-cal-grid">
        {props.cells.map((c, i) => {
          const onCellClick = props.onCellClick
          const onClick = onCellClick ? () => onCellClick(c.key) : () => c.onClick?.()
          return (
          <div
            key={c.key + i}
            className={c.cls}
            onClick={onClick}
          >
            <span className="d">{c.dayNum > 0 && c.dayNum <= 31 ? c.dayNum : ''}</span>
            {mode === 'bar' ? (
              <span className="bar"><i style={{ width: c.barPct + '%' }}></i></span>
            ) : (
              <span className="dots">
                {Array.from({ length: Math.min(c.dots || 0, 3) }, (_, j) => <i key={j}></i>)}
              </span>
            )}
            <span className="m">{c.label}</span>
          </div>
          )
        })}
      </div>
      {props.stats != null && <div className="u-muted13" style={{ textAlign: 'center', marginTop: 10 }}>{props.stats}</div>}
    </div>
  )
}
