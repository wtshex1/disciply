import { t } from '../i18n'
import type { View } from '../App'
import { MODULES, moduleNameKey, moduleDescKey } from '../lib/modules'

export default function More({ setView }: { setView: (v: View) => void }) {
  return (
    <div className="page-content active" id="page-more" data-od-id="screen-more">
      <div className="section-label" style={{ padding: '0 6px', marginBottom: 10 }}>
        <span>{t('more-life')}</span>
      </div>
      <div className="more-grid">
        {MODULES.map(item => (
          <div className="more-item glass-card" key={item.id} onClick={() => setView({ page: 'sub', id: item.id as never })}>
            <div className="more-icon">{item.icon}</div>
            <div className="more-info">
              <span className="more-name">{t(moduleNameKey(item.id))}</span>
              <span className="u-muted13">{t(moduleDescKey(item.id))}</span>
            </div>
            <span className="arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  )
}
