// Root build file — plugin versions are declared in gradle/libs.versions.toml
plugins {
    alias(libs.plugins.kotlin.multiplatform) apply false
    alias(libs.plugins.compose.multiplatform) apply false
}
