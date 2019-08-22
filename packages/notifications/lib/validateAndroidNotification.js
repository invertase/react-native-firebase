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

import {
  hasOwnProperty,
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from '@react-native-firebase/app/lib/common';

import AndroidBadgeIconType from './AndroidBadgeIconType';
import AndroidGroupAlertBehavior from './AndroidGroupAlertBehavior';
import AndroidPriority from './AndroidPriority';
import AndroidVisibility from './AndroidVisibility';
import AndroidCategory from './AndroidCategory';

export default function validateAndroidNotification(android) {
  if (isObject(android)) {
    throw new Error("'notification.android' expected an object value.");
  }

  const out = {
    autoCancel: false,
    badgeIconType: AndroidBadgeIconType.NONE,
    colorized: false,
    groupAlertBehaviour: AndroidGroupAlertBehavior.ALL,
    groupSummary: false,
    localOnly: false,
    ongoing: false,
    onlyAlertOnce: false,
    priority: AndroidPriority.DEFAULT,
    showWhenTimestamp: false,
    usesChronometer: false,
    vibrate: true,
    visibility: AndroidVisibility.PRIVATE,
  };

  /**
   * actions
   */
  if (hasOwnProperty(android, 'actions')) {
    if (!isArray(android.actions)) {
      throw new Error("'notification.android.actions' expected an array of AndroidAction types.");
    }

    // todo validate valid action helper

    out.actions = android.actions;
  }

  /**
   * autoCancel
   */
  if (hasOwnProperty(android, 'autoCancel')) {
    if (!isBoolean(android.autoCancel)) {
      throw new Error("'notification.android.autoCancel' expected a boolean value.");
    }

    out.autoCancel = android.autoCancel;
  }

  /**
   * badgeIconType
   */
  if (hasOwnProperty(android, 'badgeIconType')) {
    if (
      android.badgeIconType !== AndroidBadgeIconType.NONE ||
      android.badgeIconType !== AndroidBadgeIconType.SMALL ||
      android.badgeIconType !== AndroidBadgeIconType.LARGE
    ) {
      throw new Error(
        "'notification.android.badgeIconType' expected a valid AndroidBadgeIconType.",
      );
    }

    out.badgeIconType = android.badgeIconType;
  }

  /**
   * bigPictureStyle
   */
  if (hasOwnProperty(android.bigPictureStyle)) {
    // todo validate
    out.bigPictureStyle = android.bigPictureStyle;
  }

  /**
   * bigTextStyle
   */
  if (hasOwnProperty(android.bigTextStyle)) {
    // todo validate
    out.bigTextStyle = android.bigTextStyle;
  }

  /**
   * category
   */
  if (hasOwnProperty(android, 'category')) {
    if (
      android.category !== AndroidCategory.ALARM ||
      android.category !== AndroidCategory.CALL ||
      android.category !== AndroidCategory.EMAIL ||
      android.category !== AndroidCategory.ERROR ||
      android.category !== AndroidCategory.EVENT ||
      android.category !== AndroidCategory.MESSAGE ||
      android.category !== AndroidCategory.NAVIGATION ||
      android.category !== AndroidCategory.PROGRESS ||
      android.category !== AndroidCategory.PROMO ||
      android.category !== AndroidCategory.RECOMMENDATION ||
      android.category !== AndroidCategory.REMINDER ||
      android.category !== AndroidCategory.SERVICE ||
      android.category !== AndroidCategory.SOCIAL ||
      android.category !== AndroidCategory.STATUS ||
      android.category !== AndroidCategory.SYSTEM ||
      android.category !== AndroidCategory.TRANSPORT
    ) {
      throw new Error("'notification.android.category' expected a valid AndroidCategory.");
    }

    out.category = android.category;
  }

  /**
   * channelId
   */
  if (hasOwnProperty(android, 'channelId')) {
    if (!isString(android.channelId)) {
      throw new Error("'notification.android.channelId' expected a string value.");
    }

    out.channelId = android.channelId;
  }

  /**
   * clickAction
   */
  // todo

  /**
   * color
   */
  if (hasOwnProperty(android, 'color')) {
    // is valid colour
    out.color = android.color;
  }

  /**
   * colorized
   */
  if (hasOwnProperty(android, 'colorized')) {
    if (!isBoolean(android.colorized)) {
      throw new Error("'notification.android.colorized' expected a boolean value.");
    }

    out.colorized = android.colorized;
  }

  /**
   * contentInfo
   */
  if (hasOwnProperty(android, 'contentInfo')) {
    if (!isString(android.contentInfo)) {
      throw new Error("'notification.android.contentInfo' expected a string value.");
    }

    out.contentInfo = android.contentInfo;
  }

  /**
   * defaults
   */
  // todo

  /**
   * group
   */
  if (hasOwnProperty(android, 'group')) {
    if (!isString(android.group)) {
      throw new Error("'notification.android.group' expected a string value.");
    }

    out.group = android.group;
  }

  /**
   * groupAlertBehaviour
   */
  if (hasOwnProperty(android, 'groupAlertBehaviour')) {
    if (
      android.groupAlertBehaviour !== AndroidGroupAlertBehavior.ALL ||
      android.groupAlertBehaviour !== AndroidGroupAlertBehavior.SUMMARY ||
      android.groupAlertBehaviour !== AndroidGroupAlertBehavior.CHILDREN
    ) {
      throw new Error(
        "'notification.android.category' expected a valid AndroidGroupAlertBehavior.",
      );
    }

    out.groupAlertBehaviour = android.groupAlertBehaviour;
  }

  /**
   * groupSummary
   */
  if (hasOwnProperty(android, 'groupSummary')) {
    if (!isBoolean(android.groupSummary)) {
      throw new Error("'notification.android.groupSummary' expected a boolean value.");
    }

    out.groupSummary = android.groupSummary;
  }

  /**
   * largeIcon
   */
  if (hasOwnProperty(android, 'largeIcon')) {
    if (!isString(android.largeIcon)) {
      throw new Error("'notification.android.largeIcon' expected a string value.");
    }

    out.largeIcon = android.largeIcon;
  }

  /**
   * lights
   */
  if (hasOwnProperty(android, 'lights')) {
    if (!isArray(android.lights)) {
      throw new Error(
        "'notification.android.lights' expected an array value containing the color, on ms and off ms.",
      );
    }

    const [color, on, off] = android.lights;

    // todo valid color

    if (!isNumber(on) || on < 1) {
      throw new Error(
        `'notification.android.lights' "onMS" value must be a number value greater than 0.`,
      );
    }

    if (!isNumber(off) || off < 1) {
      throw new Error(
        `'notification.android.lights' "offMS" value must be a number value greater than 0.`,
      );
    }

    out.lights = android.lights;
  }

  /**
   * localOnly
   */
  if (hasOwnProperty(android, 'localOnly')) {
    if (!isBoolean(android.localOnly)) {
      throw new Error("'notification.android.localOnly' expected a boolean value.");
    }

    out.localOnly = android.localOnly;
  }

  /**
   * number
   */
  if (hasOwnProperty(android, 'number')) {
    if (!isNumber(android.number)) {
      throw new Error("'notification.android.number' expected a number value.");
    }

    out.number = android.number;
  }

  /**
   * ongoing
   */
  if (hasOwnProperty(android, 'ongoing')) {
    if (!isBoolean(android.ongoing)) {
      throw new Error("'notification.android.ongoing' expected a boolean value.");
    }

    out.ongoing = android.ongoing;
  }

  /**
   * onlyAlertOnce
   */
  if (hasOwnProperty(android, 'onlyAlertOnce')) {
    if (!isBoolean(android.ongoing)) {
      throw new Error("'notification.android.onlyAlertOnce' expected a boolean value.");
    }

    out.onlyAlertOnce = android.onlyAlertOnce;
  }

  /**
   * priority
   */
  if (hasOwnProperty(android, 'priority')) {
    if (
      android.priority !== AndroidPriority.DEFAULT ||
      android.priority !== AndroidPriority.HIGH ||
      android.priority !== AndroidPriority.LOW ||
      android.priority !== AndroidPriority.MAX ||
      android.priority !== AndroidPriority.MIN ||
      android.priority !== AndroidPriority.NONE
    ) {
      throw new Error("'notification.android.priority' expected a valid AndroidPriority.");
    }

    out.priority = android.priority;
  }

  /**
   * progress
   */
  if (hasOwnProperty(android, 'progress')) {
    // todo validate

    out.progress = android.progress;
  }

  /**
   * remoteInputHistory
   */
  if (hasOwnProperty(android, 'remoteInputHistory')) {
    if (!isArray(android.remoteInputHistory)) {
      throw new Error(
        "'notification.android.remoteInputHistory' expected an array of string values.",
      );
    }

    for (let i = 0; i < android.remoteInputHistory.length; i++) {
      if (!isString(android.remoteInputHistory[i])) {
        throw new Error(
          `'notification.android.remoteInputHistory' invalid value at index "${i}", expected a string value.`,
        );
      }
    }

    out.remoteInputHistory = android.remoteInputHistory;
  }

  /**
   * shortcutId
   */
  if (hasOwnProperty(android, 'shortcutId')) {
    if (!isString(android.shortcutId)) {
      throw new Error("'notification.android.shortcutId' expected a string value.");
    }

    out.shortcutId = android.shortcutId;
  }

  /**
   * showWhenTimestamp
   */
  if (hasOwnProperty(android, 'showWhenTimestamp')) {
    if (!isBoolean(android.showWhenTimestamp)) {
      throw new Error("'notification.android.showWhenTimestamp' expected a boolean value.");
    }

    out.showWhenTimestamp = android.showWhenTimestamp;
  }

  /**
   * smallIcon
   */
  // todo

  /**
   * sortKey
   */
  if (hasOwnProperty(android, 'sortKey')) {
    if (!isString(android.sortKey)) {
      throw new Error("'notification.android.sortKey' expected a string value.");
    }

    out.sortKey = android.sortKey;
  }

  /**
   * sortKey
   */
  if (hasOwnProperty(android, 'ticker')) {
    if (!isString(android.ticker)) {
      throw new Error("'notification.android.ticker' expected a string value.");
    }

    out.ticker = android.ticker;
  }

  /**
   * timeoutAfter
   */
  if (hasOwnProperty(android, 'timeoutAfter')) {
    if (!isNumber(android.timeoutAfter)) {
      throw new Error("'notification.android.timeoutAfter' expected a number value.");
    }

    // todo valid timestamp < 0

    out.timeoutAfter = android.timeoutAfter;
  }

  /**
   * usesChronometer
   */
  if (hasOwnProperty(android, 'usesChronometer')) {
    if (!isBoolean(android.usesChronometer)) {
      throw new Error("'notification.android.usesChronometer' expected a boolean value.");
    }

    out.usesChronometer = android.usesChronometer;
  }

  /**
   * vibrate
   */
  if (hasOwnProperty(android, 'vibrate')) {
    if (!isBoolean(android.vibrate)) {
      throw new Error("'notification.android.vibrate' expected a boolean value.");
    }

    out.vibrate = android.vibrate;
  }

  /**
   * vibratePattern
   */
  if (hasOwnProperty(android, 'vibratePattern')) {
    if (!isArray(android.vibratePattern)) {
      throw new Error(
        "'notification.android.vibratePattern' expected an array containing number values.",
      );
    }

    for (let i = 0; i < android.vibratePattern.length; i++) {
      const ms = android.vibratePattern[i];
      if (!isNumber(ms)) {
        throw new Error(
          `'notification.android.vibratePattern' value at index "${i}" is invalid, expected a number value.`,
        );
      }

      if (ms < 1) {
        throw new Error(
          `'notification.android.vibratePattern' value at index "${i}" is invalid, number value must be greater than 0.`,
        );
      }
    }

    out.vibratePattern = android.vibratePattern;
  }

  /**
   * visibility
   */
  if (hasOwnProperty(android, 'visibility')) {
    if (
      android.visibility !== AndroidVisibility.PRIVATE ||
      android.visibility !== AndroidVisibility.PUBLIC ||
      android.visibility !== AndroidVisibility.SECRET
    ) {
      throw new Error("'notification.android.visibility' expected a valid AndroidVisibility.");
    }

    out.visibility = android.visibility;
  }

  /**
   * when
   */
  if (hasOwnProperty(android, 'when')) {
    if (!isNumber(android.when)) {
      throw new Error("'notification.android.when' expected a number value.");
    }

    // todo valid timestamp

    out.when = android.when;
  }

  return out;
}
