const {
  withAppBuildGradle,
  withDangerousMod,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const EXPO_RECORDS_RULES_FILE = 'proguard-expo-records.pro'

/**
 * 1) Switch release minify to proguard-android-optimize.txt (Play R8).
 * 2) Ship a dedicated ProGuard file that keeps Expo @Field / Record /
 *    Kotlin metadata so camera & image-picker options still convert
 *    under optimize-mode R8.
 */
module.exports = function withR8Optimization(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const src = path.join(__dirname, EXPO_RECORDS_RULES_FILE)
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        EXPO_RECORDS_RULES_FILE
      )
      fs.copyFileSync(src, dest)
      return config
    },
  ])

  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents

    contents = contents.replace(
      /getDefaultProguardFile\(\s*["']proguard-android\.txt["']\s*\)/g,
      'getDefaultProguardFile("proguard-android-optimize.txt")'
    )

    // Ensure the Expo records rules file is in proguardFiles
    if (!contents.includes(EXPO_RECORDS_RULES_FILE)) {
      contents = contents.replace(
        /proguardFiles\s+getDefaultProguardFile\([^)]+\),\s*"proguard-rules\.pro"/,
        `proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro", "${EXPO_RECORDS_RULES_FILE}"`
      )
    }

    config.modResults.contents = contents
    return config
  })

  return config
}
