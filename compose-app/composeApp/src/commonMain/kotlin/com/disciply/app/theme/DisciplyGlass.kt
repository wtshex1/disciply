package com.disciply.app.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.HazeProgressive
import dev.chrisbanes.haze.blur.HazeBlurStyle
import dev.chrisbanes.haze.glass.GlassStyle

/**
 * Disciply "Liquid Glass expresiv" system, built on Haze 2 (haze-blur + haze-glass).
 *
 * Mirrors the current React tokens (css/tokens.css): monochrome accent,
 * radius scale 14/18/22/28 — but every surface now consumes the *backdrop*
 * (content behind it) instead of a flat background color.
 */

// --- Blur materials (HazeBlurStyle equivalents of the old glass.css scale) ---
object DisciplyBlur {
    val ultraThin = HazeBlurStyle { blurRadius(8.dp) }
    val thin = HazeBlurStyle { blurRadius(14.dp) }
    val regular = HazeBlurStyle { blurRadius(20.dp) }
    val thick = HazeBlurStyle { blurRadius(30.dp) }

    /** Progressive top fade for the shell header: sharp content -> blurred edge. */
    val headerFade = HazeBlurStyle {
        blurRadius(20.dp)
        progressive(
            HazeProgressive.verticalGradient(startIntensity = 1f, endIntensity = 0f)
        )
    }

    /** Progressive bottom fade for the bottom navigation. */
    val navFade = HazeBlurStyle {
        blurRadius(24.dp)
        progressive(
            HazeProgressive.verticalGradient(startIntensity = 0f, endIntensity = 1f)
        )
    }
}

// --- Glass styles (refraction-driven, calibrated like iOS Liquid Glass) ---
object DisciplyGlass {
    /** Default card: size-aware Regular material. */
    val card = GlassStyle.regular.then {
        shape(RoundedCornerShape(22.dp))
    }

    /** Controls over photos/video: Clear keeps the backdrop visible. */
    val clear = GlassStyle.clear.then {
        shape(RoundedCornerShape(18.dp))
        tint(Color.White.copy(alpha = 0.12f))
    }

    /** Hero / streak card: expressive, with a visible tint + stronger specular. */
    val hero = GlassStyle.regular.then {
        tint(Color.White.copy(alpha = 0.16f))
        specularIntensity(0.7f)
        ambientResponse(0.7f)
        shape(RoundedCornerShape(28.dp))
    }

    /** Bottom nav pill: compact control, keeps the 20dp edge refraction band. */
    val nav = GlassStyle.regular.then {
        shape(RoundedCornerShape(28.dp))
    }
}

@Composable
fun DisciplyTheme(dark: Boolean, content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (dark) darkColorScheme() else lightColorScheme(),
        content = content,
    )
}
