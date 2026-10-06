import { PermissionsAndroid } from 'react-native'

/**
 * Only ask the OS when a permission isn't granted yet.
 *
 * On recent Android versions, re-requesting an already-granted permission returns
 * without pausing the activity, and React Native only delivers permission results
 * on resume. The request never settles, and every later expo permission request
 * queues behind it until the app is killed.
 */
export async function ensurePermission(getAsync, requestAsync) {
  try {
    const current = await getAsync()
    if (current?.granted || current?.canAskAgain === false) return current
  } catch (_) { /* fall through to a real request */ }
  return requestAsync()
}

export async function ensureAndroidPermission(permission) {
  if (await PermissionsAndroid.check(permission)) return true
  const result = await PermissionsAndroid.request(permission)
  return result === PermissionsAndroid.RESULTS.GRANTED
}
