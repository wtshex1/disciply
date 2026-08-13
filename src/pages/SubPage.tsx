import { t } from '../i18n'
import type { View } from '../App'

export default function SubPage({ id, setView }: { id: string; setView: (v: View) => void }) {
  return (
    <div className="page-content active" id={'page-' + id} data-od-id={'screen-' + id}>
      <div className="sub-top">
        <button className="sub-back" onClick={() => setView({ page: 'more' })} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
      </div>
      <div className="sub-hero glass-card">
        <h3>{t('more-' + id)}</h3>
        <p className="u-muted13">Migration in progress</p>
      </div>
    </div>
  )
}
