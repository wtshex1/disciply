package com.disciply.app.i18n

/**
 * Type-safe port of src/i18n.ts (~300 keys x RO/EN).
 * Only the shell keys are ported in the prototype; the rest move over
 * module-by-module during migration (see README plan).
 */
enum class Lang { RO, EN }

data class Strings(
    val tabHome: String,
    val tabProgress: String,
    val tabMore: String,
    val homeToday: String,
    val homeObjectives: String,
    val homeHabitsTab: String,
    val fabTitle: String,
    val fabObjective: String,
    val fabHabit: String,
    val allCalendars: String,
)

val RoStrings = Strings(
    tabHome = "Acasă",
    tabProgress = "Progres",
    tabMore = "Mai mult",
    homeToday = "Astăzi",
    homeObjectives = "Obiective",
    homeHabitsTab = "Obiceiuri",
    fabTitle = "Ce vrei să adaugi?",
    fabObjective = "Obiectiv nou",
    fabHabit = "Obicei nou",
    allCalendars = "Toate calendarele",
)

val EnStrings = Strings(
    tabHome = "Home",
    tabProgress = "Progress",
    tabMore = "More",
    homeToday = "Today",
    homeObjectives = "Objectives",
    homeHabitsTab = "Habits",
    fabTitle = "What do you want to add?",
    fabObjective = "New objective",
    fabHabit = "New habit",
    allCalendars = "All calendars",
)

fun stringsFor(lang: Lang): Strings = when (lang) {
    Lang.RO -> RoStrings
    Lang.EN -> EnStrings
}
