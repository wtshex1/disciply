import { useRef, useState, type ReactNode } from 'react'

const OPEN_X = 192

export default function SwipeRow({ actions, children, onTap, mt }: { actions: ReactNode; children: ReactNode; onTap?: () => void; mt?: boolean }) {
  const [open, setOpen] = useState(false)
  const [x, setX] = useState(0)
  const [anim, setAnim] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ startX: 0, moved: false })
  const suppressTap = useRef(false)

  const onDown = (clientX: number) => {
    drag.current = { startX: clientX, moved: false }
    suppressTap.current = false
    setDragging(true)
    setAnim(false)
  }

  const onMove = (clientX: number) => {
    if (!dragging) return
    const raw = clientX - drag.current.startX
    const next = open ? Math.min(0, Math.max(-OPEN_X, raw)) : Math.min(0, raw)
    if (Math.abs(raw) > 6) drag.current.moved = true
    setX(next)
  }

  const onUp = () => {
    if (!dragging) return
    setDragging(false)
    if (drag.current.moved) suppressTap.current = true
    const shouldOpen = x < -OPEN_X / 3
    setOpen(shouldOpen)
    setX(shouldOpen ? -OPEN_X : 0)
    setAnim(true)
  }

  const close = () => {
    setOpen(false)
    setX(0)
    setAnim(true)
  }

  const handleTap = () => {
    if (suppressTap.current) {
      suppressTap.current = false
      return
    }
    if (open) {
      close()
      return
    }
    onTap?.()
  }

  return (
    <div className={'swipe-row' + (mt ? ' u-mt8' : '')}>
      <div className="swipe-actions">{actions}</div>
      <div
        className={'swipe-content' + (anim ? ' anim' : '')}
        style={{ transform: 'translateX(' + x + 'px)' }}
        onPointerDown={e => { if (e.pointerType === 'mouse' && e.button !== 0) return; onDown(e.clientX); e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={e => onMove(e.clientX)}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={handleTap}
      >
        {children}
      </div>
    </div>
  )
}