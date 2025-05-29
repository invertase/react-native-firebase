import { getApp } from '@react-native-firebase/app';

/**
 * @typedef {import('@firebase/app').FirebaseApp} FirebaseApp
 * @typedef {import('..').FirebaseMLTypes.Module} FirebaseML
 */

/**
 * @param {FirebaseApp | undefined} app
 * @returns {FirebaseML}
 */
export function getML(app) {
  if (app) {
    return getApp(app.name).ml();
  }
  return getApp().ml();
}
