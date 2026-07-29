/**
 * Stable identifiers for Firebase Test Lab Robo / UI automation.
 * Prefer these over ad-hoc string literals so crawlers and scripts stay in sync.
 */
export const TestIds = {
  home: {
    signIn: 'home-sign-in',
    about: 'home-about',
  },
  auth: {
    email: 'auth-email',
    password: 'auth-password',
    signIn: 'auth-sign-in',
    sendLink: 'auth-send-link',
    switchMode: 'auth-switch-mode',
  },
  dashboard: {
    signOut: 'dashboard-sign-out',
    myFiles: 'dashboard-my-files',
    uploadDoc: 'dashboard-upload-doc',
    toBeFiled: 'dashboard-to-be-filed',
    scan: 'dashboard-collect-scan',
    camera: 'dashboard-collect-camera',
    qr: 'dashboard-collect-qr',
    mic: 'dashboard-collect-mic',
    notes: 'dashboard-collect-notes',
  },
}
