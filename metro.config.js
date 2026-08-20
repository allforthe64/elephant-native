const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase JS SDK is incompatible with Metro's package.json "exports" resolution
// (RN 0.79 / Expo SDK 53 default). Without this, Auth fails at runtime with:
// "Component auth has not been registered yet"
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
