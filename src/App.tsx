import { useState } from 'react'
import { t } from './i18n'
import { useLang } from './lib/useLang'
import Onboarding from './pages/Onboarding'
import ProfileSetup from './components/ProfileSetup'
import Home from './pages/Home'
import More from './pages/More'
import Profile from './pages/Profile'
import Progress from './pages/Progress'
import AllCalendars from './pages/AllCalendars'
import HabitDetail from './pages/HabitDetail'
import ObjectiveDetail from './pages/ObjectiveDetail'
import Reason from './pages/Reason'
import Hydration from './pages/Hydration'
import Workout from './pages/Workout'
import Nutrition from './pages/Nutrition'
import Sleep from './pages/Sleep'
import Clock from './pages/Clock'
import Agenda from './pages/Agenda'
import Facial from './pages/Facial'
import AddItem from './pages/AddItem'
import SettingsModal from './components/SettingsModal'
import WorkoutModal from './components/WorkoutModal'
import { loadProfile, removeProfile } from './lib/profile'

export type View =
  | { page: 'home' }
  | { page: 'progress' }
  | { page: 'allcal' }
  | { page: 'habit'; id: number; from?: 'home' | 'progress' | 'profile' }
  | { page: 'objective'; id: number; from?: 'home' | 'progress' | 'profile' }
  | { page: 'reason'; id: number; from?: 'home' | 'progress' | 'profile' }
  | { page: 'more' }
  | { page: 'sub'; id: 'workout' | 'nutrition' | 'hydration' | 'sleep' | 'clock' | 'agenda' | 'facial' }
  | { page: 'add'; type?: 'objective' | 'habit' }
  | { page: 'profile' }

export type ModalId = 'settings' | 'workout' | null

export default function App() {
  useLang()
  const [stage, setStage] = useState<'onboarding' | 'profile' | 'main'>(() =>
    loadProfile() ? 'main' : 'onboarding'
  )
  const [view, setView] = useState<View>({ page: 'home' })
  const [modal, setModal] = useState<ModalId>(null)
  const [fabMenu, setFabMenu] = useState(false)

  if (stage !== 'main') {
    return (
      <div className="phone light" id="app">
        <div className="dynamic-island"></div>
        <div className="status-bar" id="statusBar">
          <span className="time">9:41</span>
          <div className="icons">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true"><rect x="0.5" y="1" width="13" height="10" rx="2" stroke="currentColor" stroke-opacity=".6"/><rect x="14" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" fill-opacity=".4"/><rect x="2" y="3" width="2" height="6" rx="0.5" fill="currentColor" fill-opacity=".6"/><rect x="4.5" y="2" width="2" height="8" rx="0.5" fill="currentColor" fill-opacity=".8"/><rect x="7" y="2" width="2" height="8" rx="0.5" fill="currentColor"/><rect x="9.5" y="3" width="2" height="6" rx="0.5" fill="currentColor" fill-opacity=".7"/></svg>
          </div>
        </div>
        <div className="screen-area">
          {stage === 'onboarding'
            ? <Onboarding onFinish={() => setStage('profile')} />
            : <ProfileSetup onDone={() => setStage('main')} />}
        </div>
        <div className="home-indicator"></div>
      </div>
    )
  }

  const isHome = view.page === 'home'

  const titleKey =
    view.page === 'home' ? 'tab-home'
    : view.page === 'progress' ? 'tab-progress'
    : view.page === 'allcal' ? 'allcal-title'
    : view.page === 'habit' ? 'habit-detail'
    : view.page === 'objective' ? 'objective-detail'
    : view.page === 'reason' ? 'reason-title'
    : view.page === 'more' ? 'tab-more'
    : view.page === 'profile' ? 'tab-profile'
    : view.page === 'add' ? 'add-title'
    : 'more-' + view.id

  const title = t(titleKey)

  const openModal = (id: Exclude<ModalId, null>) => setModal(id)
  const closeModal = () => setModal(null)

  return (
    <div className="phone light" id="app">
      <div className="dynamic-island"></div>

      <div className="status-bar" id="statusBar">
        <span className="time">9:41</span>
        <div className="icons">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true"><rect x="0.5" y="1" width="13" height="10" rx="2" stroke="currentColor" stroke-opacity=".6"/><rect x="14" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" fill-opacity=".4"/><rect x="2" y="3" width="2" height="6" rx="0.5" fill="currentColor" fill-opacity=".6"/><rect x="4.5" y="2" width="2" height="8" rx="0.5" fill="currentColor" fill-opacity=".8"/><rect x="7" y="2" width="2" height="8" rx="0.5" fill="currentColor"/><rect x="9.5" y="3" width="2" height="6" rx="0.5" fill="currentColor" fill-opacity=".7"/></svg>
        </div>
      </div>

      <div className="screen-area">
        <div className="main-shell active" id="mainShell">
          <div className="shell-header glass-surface" id="shellHeader" style={{ display: isHome ? 'none' : 'flex' }}>
            <h2 id="pageTitle">{title}</h2>
          </div>

          {view.page === 'home' && <Home openModal={openModal} setView={setView} />}
          {view.page === 'progress' && <Progress onRetake={() => setStage('onboarding')} setView={setView} />}
          {view.page === 'allcal' && <AllCalendars setView={setView} />}
          {view.page === 'habit' && <HabitDetail id={view.id} from={view.from} setView={setView} />}
          {view.page === 'objective' && <ObjectiveDetail id={view.id} from={view.from} setView={setView} />}
          {view.page === 'reason' && <Reason id={view.id} from={view.from} setView={setView} />}
          {view.page === 'more' && <More setView={setView} />}
          {view.page === 'sub' && view.id === 'hydration' && <Hydration setView={setView} />}
          {view.page === 'sub' && view.id === 'workout' && <Workout setView={setView} />}
          {view.page === 'sub' && view.id === 'nutrition' && <Nutrition setView={setView} />}
          {view.page === 'sub' && view.id === 'sleep' && <Sleep setView={setView} />}
          {view.page === 'sub' && view.id === 'clock' && <Clock setView={setView} />}
          {view.page === 'sub' && view.id === 'agenda' && <Agenda setView={setView} />}
          {view.page === 'sub' && view.id === 'facial' && <Facial setView={setView} />}
          {view.page === 'add' && <AddItem setView={setView} initialType={view.type} />}
          {view.page === 'profile' && <Profile setView={setView} onSignOut={() => { removeProfile(); setStage('onboarding'); setView({ page: 'home' }) }} />}

          {view.page !== 'profile' && view.page !== 'progress' && view.page !== 'allcal' && view.page !== 'habit' && view.page !== 'objective' && view.page !== 'reason' && view.page !== 'add' && (
            <button className="fab" onClick={() => setFabMenu(true)}>+</button>
          )}
        </div>
      </div>

      {fabMenu && (
        <div className="modal-overlay active" id="fabMenu" data-od-id="modal-fab" onClick={() => setFabMenu(false)}>
          <div className="modal-sheet glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <button className="close-btn" onClick={() => setFabMenu(false)} aria-label="Close">×</button>
            <h2>{t('fab-title')}</h2>
            <div className="fab-actions">
              <button className="fab-action" onClick={() => { setFabMenu(false); setView({ page: 'add', type: 'objective' }) }}>
                <span className="fab-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>
                </span>
                <span>{t('fab-objective')}</span>
                <span className="arrow">→</span>
              </button>
              <button className="fab-action" onClick={() => { setFabMenu(false); setView({ page: 'add', type: 'habit' }) }}>
                <span className="fab-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg>
                </span>
                <span>{t('fab-habit')}</span>
                <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'workout' && <WorkoutModal closeModal={closeModal} />}
      {modal === 'settings' && <SettingsModal closeModal={closeModal} onDiscovery={() => { setStage('onboarding'); setView({ page: 'home' }) }} onProfile={() => { closeModal(); setView({ page: 'profile' }) }} />}

      <div className="bottom-nav glass-nav" id="bottomNav" style={{ display: 'flex' }}>
        <button className={view.page === 'home' ? 'active' : ''} data-tab="home" onClick={() => setView({ page: 'home' })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>
          <span>{t('tab-home')}</span>
        </button>
        <button className={view.page === 'progress' || view.page === 'allcal' ? 'active' : ''} data-tab="progress" onClick={() => setView({ page: 'progress' })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>{t('tab-progress')}</span>
        </button>
        <button className={view.page === 'more' || view.page === 'sub' ? 'active' : ''} data-tab="more" onClick={() => setView({ page: 'more' })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
          <span>{t('tab-more')}</span>
        </button>
      </div>

      <div className="home-indicator"></div>
    </div>
  )
}
