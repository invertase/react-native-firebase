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

/**
 * @typedef {import("..").FirebaseApp} FirebaseApp
 * @typedef {import("..").FirebaseDynamicLinksTypes} FirebaseDynamicLinksTypes
 * @typedef {import("..").FirebaseDynamicLinksTypes.Module} FirebaseDynamicLinks
 */

// FIXME these are duplicated from the non-modular types and should be by reference
export const ShortLinkType = {
  SHORT: 'SHORT',
  UNGUESSABLE: 'UNGUESSABLE',
  DEFAULT: 'DEFAULT',
};

/**
 * @returns {FirebaseDynamicLinks}
 */
export function getDynamicLinks() {
  return firebase.dynamicLinks();
}

/**
 *
 * @param {FirebaseDynamicLinks} dynamicLinks
 * @param {FirebaseDynamicLinksTypes.DynamicLinkParameters} dynamicLinkParams
 * @returns {Promise<string>}
 */
export function buildLink(dynamicLinks, dynamicLinkParams) {
  return dynamicLinks.buildLink(dynamicLinkParams);
}

/**
 *
 * @param {FirebaseDynamicLinks} dynamicLinks
 * @param {FirebaseDynamicLinksTypes.DynamicLinkParameters} dynamicLinkParams
 * @param {FirebaseDynamicLinksTypes.ShortLinkType | undefined} shortLinkType
 * @returns {Promise<string>}
 */
export function buildShortLink(dynamicLinks, dynamicLinkParams, shortLinkType) {
  return dynamicLinks.buildShortLink(dynamicLinkParams, shortLinkType);
}

/**
 * @param {FirebaseDynamicLinks} dynamicLinks
 * @returns {Promise<FirebaseDynamicLinksTypes.DynamicLink | null>}
 */
export function getInitialLink(dynamicLinks) {
  return dynamicLinks.getInitialLink();
}

/**
 * @param {FirebaseDynamicLinks} dynamicLinks
 * @param {(link: FirebaseDynamicLinksTypes.DynamicLink) => void} listener
 * @returns {() => void}
 */
export function onLink(dynamicLinks, listener) {
  return dynamicLinks.onLink(listener);
}

/**
 *
 * @param {FirebaseDynamicLinks} dynamicLinks
 * @returns {void}
 */
export function performDiagnostics(dynamicLinks) {
  return dynamicLinks.performDiagnostics();
}

/**
 *
 * @param {FirebaseDynamicLinks} dynmaicLinks
 * @param {string} link
 * @returns {Promise<FirebaseDynamicLinksTypes.DynamicLink>}
 */
export function resolveLink(dynmaicLinks, link) {
  return dynmaicLinks.resolveLink(link);
}
