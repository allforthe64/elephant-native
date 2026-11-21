const { withAndroidManifest } = require('expo/config-plugins')

/**
 * Google Play treats some permissions / orientation hints as required hardware.
 * Declaring the features with required="false" keeps the app installable on
 * devices that lack them (no Wi‑Fi radio, landscape-only, no camera, etc.).
 */
const OPTIONAL_FEATURES = [
  'android.hardware.wifi',
  'android.hardware.screen.portrait',
  // CAMERA / RECORD_AUDIO permissions also imply these; mark optional so
  // phones without a camera/mic can still install and use the rest of the app.
  'android.hardware.camera',
  'android.hardware.camera.autofocus',
  'android.hardware.microphone',
]

function ensureOptionalFeature(manifest, name) {
  if (!Array.isArray(manifest['uses-feature'])) {
    manifest['uses-feature'] = []
  }
  const existing = manifest['uses-feature'].find((f) => f.$?.['android:name'] === name)
  if (existing) {
    existing.$['android:required'] = 'false'
    return
  }
  manifest['uses-feature'].push({
    $: {
      'android:name': name,
      'android:required': 'false',
    },
  })
}

module.exports = function withOptionalHardwareFeatures(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest
    for (const name of OPTIONAL_FEATURES) {
      ensureOptionalFeature(manifest, name)
    }
    return config
  })
}
