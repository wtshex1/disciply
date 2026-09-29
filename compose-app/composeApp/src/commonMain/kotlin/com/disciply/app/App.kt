package com.disciply.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeInput
import dev.chrisbanes.haze.hazeSource
import dev.chrisbanes.haze.rememberHazeState
import dev.chrisbanes.haze.blur.hazeBlur
import dev.chrisbanes.haze.glass.hazeGlass
import com.disciply.app.i18n.Lang
import com.disciply.app.i18n.stringsFor
import com.disciply.app.nav.Route
import com.disciply.app.theme.DisciplyBlur
import com.disciply.app.theme.DisciplyGlass
import com.disciply.app.theme.DisciplyTheme

/**
 * Prototype shell: the same Disciply IA (Home / Progress / More + bottom nav)
 * rendered as Liquid Glass over a colorful backdrop.
 *
 * Haze pattern (Backdrop input — the portable, recommended default):
 *  1. Background content registers as a source: Modifier.hazeSource(state)
 *  2. Glass/blur surfaces consume already-drawn pixels: HazeInput.Backdrop(state)
 *     with HazeInput.Sources(state) as the explicit-source fallback.
 *
 * The expressive gradient below stands in for the user's real content.
 * On this backdrop, Regular vs Clear glass and progressive blur are visible;
 * on a flat monochrome background the effect would be (correctly) subtle.
 */
@Composable
fun App() {
    var dark by remember { mutableStateOf(false) }
    var lang by remember { mutableStateOf(Lang.RO) }
    var route by remember { mutableStateOf<Route>(Route.Home) }
    val s = stringsFor(lang)
    val hazeState = rememberHazeState()

    DisciplyTheme(dark = dark) {
        Box(Modifier.fillMaxSize()) {
            // 1) Backdrop source: expressive gradient so refraction/blur read clearly.
            Box(
                Modifier
                    .fillMaxSize()
                    .hazeSource(hazeState)
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                Color(0xFF1B2A6B),
                                Color(0xFF7B2FF7),
                                Color(0xFFF72F8A),
                                Color(0xFFFF8A3D),
                            )
                        )
                    )
            )

            Column(Modifier.fillMaxSize()) {
                // 2) Progressive-blur header (replaces shell-header + glass-surface).
                Box(
                    Modifier
                        .fillMaxWidth()
                        .hazeBlur(
                            input = HazeInput.Sources(hazeState),
                            style = DisciplyBlur.headerFade,
                        )
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                ) {
                    Text(
                        when (route) {
                            Route.Home -> s.tabHome
                            Route.Progress -> s.tabProgress
                            Route.More -> s.tabMore
                            else -> s.tabHome
                        },
                        color = Color.White,
                    )
                }

                // 3) Hero glass card (Regular + tint + specular).
                Box(
                    Modifier
                        .padding(20.dp)
                        .hazeGlass(
                            input = HazeInput.Backdrop(hazeState),
                            style = DisciplyGlass.hero,
                        )
                        .padding(20.dp),
                ) {
                    Text("Disciply — Liquid Glass", color = Color.White)
                }

                // 4) Content glass card (Clear over the vivid zone).
                Box(
                    Modifier
                        .padding(horizontal = 20.dp)
                        .hazeGlass(
                            input = HazeInput.Backdrop(hazeState),
                            style = DisciplyGlass.clear,
                        )
                        .padding(20.dp),
                ) {
                    Text(s.homeToday, color = Color.White)
                }
            }

            // 5) Bottom nav: compact glass pill, replaces .bottom-nav.glass-nav.
            Box(
                Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
                    .hazeGlass(
                        input = HazeInput.Backdrop(hazeState),
                        style = DisciplyGlass.nav,
                    )
                    .padding(horizontal = 24.dp, vertical = 14.dp),
            ) {
                Text(
                    "${s.tabHome} · ${s.tabProgress} · ${s.tabMore}",
                    color = Color.White,
                )
            }
        }
    }
}
