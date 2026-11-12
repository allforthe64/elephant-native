const { withAppBuildGradle } = require('@expo/config-plugins')

// The default proguard-android.txt contains -dontoptimize, which turns R8 into a
// shrink/obfuscate-only pass. The -optimize variant lets R8 inline and remove dead code.
module.exports = function withR8Optimization(config) {
    return withAppBuildGradle(config, (config) => {
        config.modResults.contents = config.modResults.contents.replace(
            /getDefaultProguardFile\(\s*["']proguard-android\.txt["']\s*\)/g,
            'getDefaultProguardFile("proguard-android-optimize.txt")'
        )
        return config
    })
}
