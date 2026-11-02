import groovy.json.JsonSlurper

plugins { id("com.android.application") }

// The game version comes from package.json: one source of truth for the web, file and Android builds.
val gameVersion = (JsonSlurper().parse(rootDir.resolve("../package.json")) as Map<*, *>)["version"] as String
val (major, minor, patch) = gameVersion.split(".").map { it.takeWhile(Char::isDigit).toInt() }

android {
    namespace = "fr.resonance.industrielle"
    compileSdk = 37
    defaultConfig {
        applicationId = "fr.resonance.industrielle"
        minSdk = 26
        targetSdk = 37
        versionCode = major * 10000 + minor * 100 + patch
        versionName = gameVersion
    }
    // Release signing: keystore path and passwords come from the environment (GitHub secrets in CI).
    val keystore = System.getenv("RESONANCE_KEYSTORE")
    signingConfigs {
        if (keystore != null) create("release") {
            storeFile = file(keystore)
            storePassword = System.getenv("RESONANCE_KEYSTORE_PASSWORD")
            keyAlias = System.getenv("RESONANCE_KEY_ALIAS") ?: "resonance"
            keyPassword = System.getenv("RESONANCE_KEYSTORE_PASSWORD")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (keystore != null) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    sourceSets["main"].assets.directories.add(layout.buildDirectory.dir("generated/game").get().asFile.path)
}

// Copy the single-file game into the APK assets before each build.
val copyGame by tasks.registering(Copy::class) {
    from(rootDir.resolve("../Resonance-Industrielle.html")) { rename { "index.html" } }
    into(layout.buildDirectory.dir("generated/game"))
}
tasks.named("preBuild") { dependsOn(copyGame) }

dependencies {
    implementation("androidx.webkit:webkit:1.18.0")
    implementation("androidx.core:core:1.19.1")
    implementation("androidx.activity:activity:1.13.0")
}
