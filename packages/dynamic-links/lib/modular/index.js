/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { firebase } from '..';

export const ShortLinkType = {
  SHORT: 'SHORT',
  UNGUESSABLE: 'UNGUESSABLE',
  DEFAULT: 'DEFAULT',
};

/**
 * @param {import('@react-native-firebase/app').ReactNativeFirebase.FirebaseApp} app
 * @returns {import('.').DynamicLinks}
 */
export function getDynamicLinks(app) {
  if (app) {
    return app.dynamicLinks();
  }
  return firebase.dynamicLinks();
}

/**
 *
 * @param {import('.').DynamicLinks} dynamicLinks
 * @param {import('..').FirebaseDynamicLinksTypes.DynamicLinkParameters} dynamicLinkParams
 * @returns {Promise<string>}
 */
export function buildLink(dynamicLinks, dynamicLinkParams) {
  return dynamicLinks.buildLink(dynamicLinkParams);
}

/**
 *
 * @param {import('.').DynamicLinks} dynamicLinks
 * @param {import('..').FirebaseDynamicLinksTypes.DynamicLinkParameters} dynamicLinkParams
 * @param {import('..').FirebaseDynamicLinksTypes.ShortLinkType | undefined} shortLinkType
 * @returns {Promise<string>}
 */
export function buildShortLink(dynamicLinks, dynamicLinkParams, shortLinkType) {
  return dynamicLinks.buildShortLink(dynamicLinkParams, shortLinkType);
}

/**
 * @param {import('.').DynamicLinks} dynamicLinks
 * @returns {Promise<import('..').FirebaseDynamicLinksTypes.DynamicLink | null>}
 */
export function getInitialLink(dynamicLinks) {
  return dynamicLinks.getInitialLink();
}

/**
 * @param {import('.').DynamicLinks} dynamicLinks
 * @param {(link: import('..').FirebaseDynamicLinksTypes.DynamicLink) => void} listener
 * @returns {() => void}
 */
export function onLink(dynamicLinks, listener) {
  return dynamicLinks.onLink(listener);
}

/**
 *
 * @param {import('.').DynamicLinks} dynamicLinks
 * @returns {void}
 */
export function performDiagnostics(dynamicLinks) {
  return dynamicLinks.performDiagnostics();
}

/**
 *
 * @param {import('.').DynamicLinks} dynmaicLinks
 * @param {string} link
 * @returns {Promise<import('..').FirebaseDynamicLinksTypes.DynamicLink>}
 */
export function resolveLink(dynmaicLinks, link) {
  return dynmaicLinks.resolveLink(link);
}
