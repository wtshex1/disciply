package com.disciply.app.nav

import com.disciply.app.data.LifeModule

/** Mirrors the View union in src/App.tsx. */
sealed interface Route {
    data object Home : Route
    data object Progress : Route
    data object AllCalendars : Route
    data class Habit(val id: Long) : Route
    data class Objective(val id: Long) : Route
    data class Reason(val id: Long) : Route
    data object More : Route
    data class Sub(val module: LifeModule) : Route
    data class Add(val type: AddType?) : Route
    data object Profile : Route
}

enum class AddType { OBJECTIVE, HABIT }
