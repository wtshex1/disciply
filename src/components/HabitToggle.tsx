import { t } from '../i18n'
import { isHabit, toggleHabit, useHabits } from '../lib/habits'

export default function HabitToggle({ moduleId }: { moduleId: string }) {
  useHabits()
  const on = isHabit(moduleId)
  return (
    <button
      type="button"
      className={'hero-habit' + (on ? ' on' : '')}
      onClick={() => toggleHabit(moduleId)}
      title={on ? t('habit-remove') : t('habit-add')}
      aria-label={on ? t('habit-remove') : t('habit-add')}
    >
      <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5l2.7 6.1 6.6.6-5 4.4 1.5 6.4L12 16.6l-5.8 3.4 1.5-6.4-5-4.4 6.6-.6L12 2.5z" />
      </svg>
    </button>
  )
}
