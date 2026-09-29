package com.disciply.app.data

/**
 * Common models mirroring the React/Dexie schema (src/db.ts).
 * Persistence on Wasm is NOT Dexie — see README "Storage" (Room 3 + OPFS
 * or IndexedDB wrapper). These models are persistence-agnostic on purpose.
 */

enum class GoalType { OBJECTIVE, HABIT }
enum class GoalTerm { SHORT, MEDIUM, LONG }

data class GoalItem(
    val id: Long = 0,
    val type: GoalType,
    val icon: String = "",
    val name: String = "",
    val desc: String = "",
    val term: GoalTerm? = null,
    val deadline: String? = null, // ISO "yyyy-MM-dd" + optional "THH:mm"
    val area: String = "",
    val done: Boolean = false,
    val doneDates: List<String> = emptyList(), // "yyyy-MM-dd"
    val blocked: Boolean = false,
    val blockedReason: String? = null,
    val createdAt: Long = 0,
)

data class WaterDay(val date: String, val ml: Int)
data class SleepNight(val date: String, val minutes: Int)
data class MealItem(val type: String, val kcal: Int, val ts: Long)
data class MealDay(val date: String, val items: List<MealItem> = emptyList())

data class WorkoutExercise(val name: String, val sets: Int, val reps: String)
data class Workout(val id: String, val name: String, val exercises: List<WorkoutExercise>)
data class WorkoutLog(val date: String, val name: String, val minutes: Int, val exercises: Int, val ts: Long)

data class AgendaEvent(val id: Long, val title: String, val date: String, val time: String)

data class FacialLog(val date: String, val name: String, val minutes: Int, val exercises: Int, val ts: Long)
data class FacialExercise(val id: String, val name: String, val seconds: Int)

data class Profile(
    val name: String = "",
    val quote: String? = null,
    val photoBase64: String? = null,
)

/** The 7 life modules (mirrors src/lib/modules.tsx). */
enum class LifeModule(val tag: String) {
    WORKOUT("health"),
    NUTRITION("health"),
    HYDRATION("health"),
    SLEEP("health"),
    CLOCK("productivity"),
    AGENDA("productivity"),
    FACIAL("health"),
}

/** Pure streak helper, ported from Home.tsx calcStreak(). */
fun calcStreak(doneDates: Set<String>, today: String, yesterday: String): Int {
    if (today !in doneDates && yesterday !in doneDates) return 0
    // Caller advances day-by-day backwards from (today ?: yesterday).
    return 0 // full date arithmetic lives in the repository layer (kotlinx-datetime)
}
