import { useRef, useState } from 'react'
import { t, toggleLangNow } from '../i18n'
import { useLang } from '../lib/useLang'
import { saveQuizResult } from '../lib/profile'
import {
  CATEGORIES, MODES, SCALE_VALUES, QUESTIONS,
  catName, modeName, modeDesc, modeTime, questionText, scaleLabels, selectQuiz,
  type Question
} from '../questions'

const WELCOME = 0
const MODE = 1
const QUESTIONS_START = 2

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const lang = useLang()
  const [slide, setSlide] = useState(0)
  const [modeKey, setModeKey] = useState<'quick' | 'balanced' | 'full'>('balanced')
  const [quiz, setQuiz] = useState<Question[]>(() => selectQuiz('balanced'))
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [attrValues, setAttrValues] = useState<Record<string, { id: number; val: number }[]>>({})
  const attrRef = useRef<Record<string, { id: number; val: number }[]>>({})
  const [results, setResults] = useState<{ overall: number; vals: number[] } | null>(null)
  const autoTimer = useRef<number | null>(null)
  const slideRef = useRef(0)
  slideRef.current = slide

  const resultIndex = QUESTIONS_START + quiz.length
  const isResult = slide === resultIndex
  const isQuestion = slide >= QUESTIONS_START && slide < resultIndex
  const qIdx = slide - QUESTIONS_START
  const currentQ = isQuestion ? quiz[qIdx] : null

  const showSlide = (n: number) => {
    if (autoTimer.current) window.clearTimeout(autoTimer.current)
    if (n === resultIndex) {
      const vals = CATEGORIES.map(c => {
        const items = attrRef.current[c.key] || []
        if (!items.length) return 0
        const scored = items.map(a => {
          const q = QUESTIONS.find(x => x.id === a.id)
          return q && q.rev ? 125 - a.val : a.val
        })
        return Math.round(scored.reduce((s, v) => s + v, 0) / scored.length)
      })
      const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      const result = { overall, vals }
      setResults(result)
      saveQuizResult(result)
    }
    setSlide(n)
  }

  const next = () => {
    if (isResult) return onFinish()
    const n = slide + 1
    if (n <= resultIndex) showSlide(n)
  }

  const prev = () => {
    if (slide > 0) showSlide(slide - 1)
  }

  const selectMode = (key: 'quick' | 'balanced' | 'full') => {
    setModeKey(key)
    setQuiz(selectQuiz(key))
    setAnswers({})
    setAttrValues({})
    attrRef.current = {}
  }

  const pickAnswer = (val: number) => {
    if (!currentQ) return
    const q = currentQ
    setAnswers(a => ({ ...a, [q.id]: val }))
    attrRef.current = (() => {
      const list = attrRef.current[q.cat] || []
      const i = list.findIndex(x => x.id === q.id)
      return {
        ...attrRef.current,
        [q.cat]: i > -1
          ? list.map((x, j) => (j === i ? { id: q.id, val } : x))
          : [...list, { id: q.id, val }]
      }
    })()
    setAttrValues(attrRef.current)
    if (autoTimer.current) window.clearTimeout(autoTimer.current)
    autoTimer.current = window.setTimeout(() => showSlide(slideRef.current + 1), 420)
  }

  const mode = MODES.find(m => m.key === modeKey)!
  const cat = currentQ ? CATEGORIES.find(c => c.key === currentQ.cat) : null
  const answered = currentQ ? answers[currentQ.id] : undefined
  const progress = isQuestion ? Math.round((qIdx / quiz.length) * 100) : 0
  const chipInline = cat
    ? { background: cat.color + '1A', color: cat.color, borderColor: cat.color + '40' }
    : undefined

  const nextLabel = slide === WELCOME ? t('btn-start') : isResult ? t('btn-begin') : t('btn-next')

  return (
    <div className="onboarding active" id="onboarding" data-od-id="onboarding">
      <button className="lang-toggle lang-toggle-float" onClick={toggleLangNow} aria-label="Language">
        <span className={lang === 'en' ? 'active' : ''} data-lt="en">EN</span><span className="lt-sep">/</span><span className={lang === 'ro' ? 'active' : ''} data-lt="ro">RO</span>
      </button>
      <button className="skip-float" onClick={onFinish}>{t('btn-skip')}</button>
      <div className="slide-wrap">
        <div className={'slide' + (slide === 0 ? ' active' : '')} data-slide="0">
          <div className="illustration"><img src="/images/app-logo.png" alt="Disciply" style={{ width: 132, height: 132, objectFit: 'contain', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,0.12))' }} /></div>
          <h1>{t('onboarding-welcome-title')}</h1>
          <p>{t('onboarding-welcome-sub')}</p>
          <div className="quiz-meta">
            <span className="quiz-meta-chip">{t('onboarding-chip-dim')}</span>
            <span className="quiz-meta-chip">{t('onboarding-chip-q')}</span>
            <span className="quiz-meta-chip">{t('onboarding-chip-time')}</span>
          </div>
        </div>

        <div className={'slide' + (slide === 1 ? ' active' : '')} data-slide="1">
          <div className="mode-head quiz-enter">
            <span className="q-chip" style={{ background: '#0A0A0A', color: '#FFFFFF', borderColor: '#0A0A0A' }}>{t('onboarding-mode-step')}</span>
            <h2 className="q-title mode-title">{t('onboarding-mode-title')}</h2>
            <p className="mode-sub">{t('onboarding-mode-sub')}</p>
          </div>
          <div className="mode-list" id="modeList">
            {MODES.map(m => (
              <button
                type="button"
                key={m.key}
                className={'mode-card quiz-enter' + (m.key === modeKey ? ' selected' : '')}
                data-mode={m.key}
                onClick={() => selectMode(m.key)}
              >
                <span className="mode-radio"></span>
                <span className="mode-main">
                  <span className="mode-name">{modeName(m)}{m.rec ? <span className="mode-rec">{t('mode-rec')}</span> : null}</span>
                  <span className="mode-desc">{modeDesc(m)} · {modeTime(m)}</span>
                </span>
                <span className="mode-count">{m.count}<small>Q</small></span>
              </button>
            ))}
          </div>
          <p className="mode-meta" id="modeMeta">
            {quiz.length} {lang === 'ro' ? 'de întrebări' : 'questions'} · {modeTime(mode)} · {lang === 'ro' ? 'toate cele 6 dimensiuni acoperite' : 'all 6 dimensions covered'}
          </p>
        </div>

        <div className={'slide' + (isQuestion ? ' active' : '')} data-slide="2">
          {currentQ && cat && (
            <div className="quiz-stage" id="quizStage">
              <div className="quiz-head quiz-enter">
                <div className="quiz-progress">
                  <div className="quiz-progress-track"><div className="quiz-progress-fill" style={{ width: progress + '%' }}></div></div>
                </div>
                <div className="quiz-meta-row">
                  <span>{t('question-of').replace('{0}', String(qIdx + 1)).replace('{1}', String(quiz.length))}</span>
                  <span>{progress}%</span>
                </div>
                <span className="q-chip" style={chipInline}>{catName(cat)}</span>
              </div>
              <h2 className="q-title quiz-enter">{questionText(currentQ)}</h2>
              <div className="q-scale quiz-enter">
                <span>{t('scale-0')}</span>
                <span>{t('scale-3')}</span>
              </div>
              <div className="q-options">
                {scaleLabels().map((label, i) => {
                  const val = SCALE_VALUES[i]
                  return (
                    <button
                      type="button"
                      key={i}
                      className={'q-opt quiz-enter' + (answered === val ? ' selected' : '')}
                      data-val={val}
                      onClick={() => pickAnswer(val)}
                    >
                      <span className="q-opt-num">{i + 1}</span>
                      <span className="q-opt-label">{label}</span>
                      <svg className="q-opt-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className={'slide' + (isResult ? ' active' : '')} data-slide="3">
          {results && (
            <>
              <div className="result-sphere-wrap">
                <div className="result-ring-wrap">
                  <svg className="result-ring-svg" viewBox="0 0 100 100">
                    <circle className="result-ring-bg" cx="50" cy="50" r="42" />
                    <circle className="result-ring-fg" cx="50" cy="50" r="42" style={{ strokeDasharray: 264, strokeDashoffset: 264 - 264 * results.overall / 100 }} />
                  </svg>
                  <div className="result-center">
                    <span className="sphere-pct" id="resultOverall">{results.overall}</span>
                    <span className="sphere-label">{t('result-overall')}</span>
                  </div>
                </div>
              </div>
              <h1 id="resultTitle">{t('result-title').replace('{0}', String(results.overall))}</h1>
              <p id="resultDesc" style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                {(() => {
                  const vals = results.vals
                  const maxIdx = vals.indexOf(Math.max(...vals))
                  const minIdx = vals.indexOf(Math.min(...vals))
                  const tier = Math.min(5, Math.floor(results.overall / 17))
                  return t('result-desc')
                    .replace('{0}', catName(CATEGORIES[maxIdx]))
                    .replace('{1}', String(vals[maxIdx]))
                    .replace('{2}', catName(CATEGORIES[minIdx]))
                    .replace('{3}', String(vals[minIdx]))
                    .replace('{4}', t('cmp-' + tier))
                })()}
              </p>
              <div className="result-bars" id="resultBars">
                {CATEGORIES.map((c, i) => (
                  <div className="result-bar-row" key={c.key}>
                    <span className="rb-name">{catName(c)}</span>
                    <div className="rb-track"><span style={{ width: results.vals[i] + '%', background: c.color }}></span></div>
                    <span className="rb-pct">{results.vals[i]}%</span>
                  </div>
                ))}
              </div>
              <p className="result-note" id="resultNote">{t('result-note').replace('{0}', String(quiz.length))}</p>
            </>
          )}
        </div>
      </div>
      <div className="nav-row">
        <button className="back" id="backBtn" onClick={prev} aria-label="Back" style={{ visibility: slide === 0 ? 'hidden' : 'visible' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <button className="next" id="nextBtn" onClick={next} disabled={isQuestion && answered === undefined}>
          {nextLabel}{slide === WELCOME ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg> : null}
        </button>
      </div>
    </div>
  )
}
