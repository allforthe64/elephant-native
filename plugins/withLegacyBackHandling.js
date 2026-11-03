const { withAndroidManifest } = require('expo/config-plugins')

/**
 * Apps targeting Android 16 (API 36) get predictive back by default, which
 * stops the system from delivering back presses to React Native: the back
 * button closes the app instead of going to the previous screen.
 * Opting out restores normal back handling.
 */
module.exports = function withLegacyBackHandling(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (application) {
      application.$['android:enableOnBackInvokedCallback'] = 'false'
    }
    return config
  })
}
