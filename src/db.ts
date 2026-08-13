import Dexie, { type Table } from 'dexie'

export interface WaterRow {
  date: string
  ml: number
}

export interface HydProfile {
  id: number
  weight: number | null
}

export interface SleepRow {
  date: string
  min: number
}

export interface MealItem {
  type: string
  kcal: number
  ts: number
}

export interface MealRow {
  date: string
  items: MealItem[]
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: string
}

export interface Workout {
  id: string
  name: string
  exercises: WorkoutExercise[]
}

export interface WktLogRow {
  date: string
  name: string
  min: number
  ex: number
  ts: number
}

export interface AgendaEvent {
  id: number
  title: string
  date: string
  time: string
}

export interface FacialLogRow {
  date: string
  name: string
  min: number
  ex: number
  ts: number
}

export interface FacialEx {
  id: string
  name: string
  sec: number
}

export type GoalTerm = 'short' | 'medium' | 'long'

export interface GoalItem {
  id?: number
  type: 'objective' | 'habit'
  icon: string
  name: string
  desc: string
  term?: GoalTerm
  deadline?: string
  area: string
  done: boolean
  doneDates: string[]
  blocked?: boolean
  blockedReason?: string
  createdAt: number
}

export class DisciplyDB extends Dexie {
  water!: Table<WaterRow, string>
  hydProfile!: Table<HydProfile, number>
  sleep!: Table<SleepRow, string>
  meals!: Table<MealRow, string>
  workouts!: Table<Workout, string>
  wktLogs!: Table<WktLogRow, string>
  events!: Table<AgendaEvent, number>
  facialLogs!: Table<FacialLogRow, string>
  facialExs!: Table<FacialEx, string>
  goals!: Table<GoalItem, number>

  constructor() {
    super('disciply')
    this.version(1).stores({
      water: 'date',
      hydProfile: 'id'
    })
    this.version(2).stores({
      water: 'date',
      hydProfile: 'id',
      sleep: 'date',
      meals: 'date',
      workouts: 'id',
      wktLogs: 'date, ts',
      events: 'id, date'
    })
    this.version(3).stores({
      water: 'date',
      hydProfile: 'id',
      sleep: 'date',
      meals: 'date',
      workouts: 'id',
      wktLogs: 'date, ts',
      events: 'id, date',
      facialLogs: 'date, ts'
    })
    this.version(4).stores({
      water: 'date',
      hydProfile: 'id',
      sleep: 'date',
      meals: 'date',
      workouts: 'id',
      wktLogs: 'date, ts',
      events: 'id, date',
      facialLogs: 'date, ts',
      facialExs: 'id'
    })
    this.version(5).stores({
      water: 'date',
      hydProfile: 'id',
      sleep: 'date',
      meals: 'date',
      workouts: 'id',
      wktLogs: 'date, ts',
      events: 'id, date',
      facialLogs: 'date, ts',
      facialExs: 'id',
      goals: 'id, type'
    })
    this.version(6).stores({
      water: 'date',
      hydProfile: 'id',
      sleep: 'date',
      meals: 'date',
      workouts: 'id',
      wktLogs: 'date, ts',
      events: 'id, date',
      facialLogs: 'date, ts',
      facialExs: 'id',
      goals: '++id, type'
    })
  }
}

export const db = new DisciplyDB()

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export async function migrateFromStorage() {
  try {
    await db.transaction('rw', [db.water, db.hydProfile, db.sleep, db.meals, db.workouts, db.wktLogs, db.events], async () => {
      const hyd = parse<{ days?: Record<string, number>; weight?: number }>(lsGet('disciply-hydration'), {})
      if ((await db.water.count()) === 0 && hyd.days) {
        for (const [date, ml] of Object.entries(hyd.days)) {
          if (typeof ml === 'number' && ml > 0) await db.water.put({ date, ml })
        }
        if (hyd.weight != null) await db.hydProfile.put({ id: 1, weight: hyd.weight })
      }

      const sleep = parse<{ nights?: Record<string, number> }>(lsGet('disciply-sleep'), {})
      if ((await db.sleep.count()) === 0 && sleep.nights) {
        for (const [date, min] of Object.entries(sleep.nights)) {
          if (typeof min === 'number' && min > 0) await db.sleep.put({ date, min })
        }
      }

      const meals = parse<{ days?: Record<string, MealItem[]> }>(lsGet('disciply-meals'), {})
      if ((await db.meals.count()) === 0 && meals.days) {
        for (const [date, items] of Object.entries(meals.days)) {
          if (Array.isArray(items) && items.length) await db.meals.put({ date, items })
        }
      }

      const workouts = parse<Workout[]>(lsGet('disciply-workouts'), [])
      if ((await db.workouts.count()) === 0 && Array.isArray(workouts)) {
        for (const w of workouts) {
          if (w && w.id && Array.isArray(w.exercises)) await db.workouts.put(w)
        }
      }

      const logs = parse<Record<string, WktLogRow[]>>(lsGet('disciply-wkt-logs'), {})
      if ((await db.wktLogs.count()) === 0) {
        for (const [date, list] of Object.entries(logs)) {
          if (Array.isArray(list)) {
            for (const e of list) await db.wktLogs.put({ date, name: e.name, min: e.min || 0, ex: e.ex || 0, ts: e.ts || 0 })
          }
        }
      }

      const ag = parse<{ events?: AgendaEvent[] }>(lsGet('disciply-events'), {})
      if ((await db.events.count()) === 0 && Array.isArray(ag.events)) {
        for (const e of ag.events) {
          if (e && e.id) await db.events.put(e)
        }
      }
    })
  } catch (e) {}
}
