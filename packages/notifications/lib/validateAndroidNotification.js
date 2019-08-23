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
  isUndefined,
} from '@react-native-firebase/app/lib/common';

import AndroidBadgeIconType from './AndroidBadgeIconType';
import AndroidGroupAlertBehavior from './AndroidGroupAlertBehavior';
import AndroidPriority from './AndroidPriority';
import AndroidVisibility from './AndroidVisibility';
import AndroidCategory from './AndroidCategory';
import {
  isValidColor,
  isValidLightPattern,
  isValidRemoteInputHistory,
  isValidTimestamp,
  isValidVibratePattern,
} from './validate';
import AndroidDefaults from './AndroidDefaults';

export default function validateAndroidNotification(android) {
  const out = {
    autoCancel: true,
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

  if (!isUndefined(android) && !isObject(android)) {
    throw new Error("'notification.android' expected an object value.");
  }

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
    if (!isObject(android.bigPictureStyle)) {
      throw new Error("'notification.android.bigPictureStyle' expected an object value.");
    }

    if (!isString(android.bigPictureStyle.picture) || !android.bigPictureStyle.picture) {
      throw new Error("'notification.android.bigPictureStyle.picture' expected a string value.");
    }

    const bigPictureStyle = {
      picture: android.bigPictureStyle.picture,
    };

    if (hasOwnProperty(android.bigPictureStyle.largeIcon)) {
      if (!isString(android.bigPictureStyle.largeIcon) || !android.bigPictureStyle.largeIcon) {
        throw new Error(
          "'notification.android.bigPictureStyle.largeIcon' expected a string value.",
        );
      }

      bigPictureStyle.largeIcon = android.bigPictureStyle.largeIcon;
    }

    if (hasOwnProperty(android.bigPictureStyle.contentTitle)) {
      if (!isString(android.bigPictureStyle.contentTitle)) {
        throw new Error(
          "'notification.android.bigPictureStyle.contentTitle' expected a string value.",
        );
      }

      bigPictureStyle.contentTitle = android.bigPictureStyle.contentTitle;
    }

    if (hasOwnProperty(android.bigPictureStyle.summaryText)) {
      if (!isString(android.bigPictureStyle.summaryText)) {
        throw new Error(
          "'notification.android.bigPictureStyle.summaryText' expected a string value.",
        );
      }

      bigPictureStyle.summaryText = android.bigPictureStyle.summaryText;
    }

    out.bigPictureStyle = bigPictureStyle;
  }

  /**
   * bigTextStyle
   */
  if (hasOwnProperty(android.bigTextStyle)) {
    if (!isObject(android.bigTextStyle)) {
      throw new Error("'notification.android.bigTextStyle' expected an object value.");
    }

    if (!isString(android.bigTextStyle.text) || !android.bigTextStyle.text) {
      throw new Error("'notification.android.bigTextStyle.text' expected a string value.");
    }

    const bigTextStyle = {
      text: android.bigTextStyle.text,
    };

    if (hasOwnProperty(android.bigTextStyle.contentTitle)) {
      if (!isString(android.bigTextStyle.contentTitle)) {
        throw new Error(
          "'notification.android.bigTextStyle.contentTitle' expected a string value.",
        );
      }

      bigTextStyle.contentTitle = android.bigTextStyle.contentTitle;
    }

    if (hasOwnProperty(android.bigTextStyle.summaryText)) {
      if (!isString(android.bigTextStyle.summaryText)) {
        throw new Error("'notification.android.bigTextStyle.summaryText' expected a string value.");
      }

      bigTextStyle.summaryText = android.bigTextStyle.summaryText;
    }

    out.bigTextStyle = bigTextStyle;
  }

  // Validate both are not set
  if (out.bigPictureStyle && out.bigTextStyle) {
    throw new Error(
      "'notification.android' cannot set a bigPictureStyle and bigTextStyle in the same notification.",
    );
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
   * TODO is this now required?
   * */
  if (hasOwnProperty(android, 'channelId')) {
    if (!isString(android.channelId)) {
      throw new Error("'notification.android.channelId' expected a string value.");
    }

    out.channelId = android.channelId;
  }

  /**
   * clickAction
   */
  if (hasOwnProperty(android, 'clickAction')) {
    if (!isString(android.clickAction)) {
      throw new Error("'notification.android.clickAction' expected a string value.");
    }

    out.clickAction = android.clickAction;
  }

  /**
   * color
   */
  if (hasOwnProperty(android, 'color')) {
    if (!isString(android.color)) {
      throw new Error("'notification.android.color' expected a string value.");
    }

    if (!isValidColor(android.color)) {
      throw new Error(
        "'notification.android.color' invalid color. Expected an AndroidColor or hexadecimal string value.",
      );
    }

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
  if (hasOwnProperty(android, 'defaults')) {
    if (!isArray(android.defaults)) {
      throw new Error("'notification.android.defaults' expected an array.");
    }

    if (android.defaults.length === 0) {
      throw new Error(
        "'notification.android.defaults' expected an array containing AndroidDefaults.",
      );
    }

    for (let i = 0; i < android.defaults.length; i++) {
      const value = android.defaults[i];

      if (
        value !== AndroidDefaults.ALL ||
        value !== AndroidDefaults.LIGHTS ||
        value !== AndroidDefaults.SOUND ||
        value !== AndroidDefaults.VIBRATE
      ) {
        throw new Error(
          "'notification.android.defaults' invalid array value, expected a AndroidDefaults value.",
        );
      }
    }

    out.defaults = android.defaults;
  }

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
        "'notification.android.groupAlertBehaviour' expected a valid AndroidGroupAlertBehavior.",
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
    if (!isString(android.largeIcon) || !android.largeIcon) {
      throw new Error("'notification.android.largeIcon' expected a valid string value.");
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

    const [valid, property] = isValidLightPattern(android.lights);

    if (!valid) {
      switch (property) {
        case 'color':
          throw new Error(
            "'notification.android.lights' invalid color. Expected an AndroidColor or hexadecimal string value.",
          );
        case 'onMs':
          throw new Error(
            `'notification.android.lights' invalid "on" millisecond value, expected a number greater than 0.`,
          );
        case 'offMs':
          throw new Error(
            `'notification.android.lights' invalid "off" millisecond value, expected a number greater than 0.`,
          );
      }
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
    if (!isObject(android.progress)) {
      throw new Error("'notification.android.progress' expected an object value.");
    }

    if (!isNumber(android.progress.max)) {
      throw new Error("'notification.android.progress.max' expected a number value.");
    }

    if (!isNumber(android.progress.current)) {
      throw new Error("'notification.android.progress.current' expected a number value.");
    }

    if (android.progress.max < android.progress.current) {
      throw new Error(
        "'notification.android.progress.current' current progress can not exceed max progress value.",
      );
    }

    const progress = {
      max: android.progress.max,
      current: android.progress.current,
      indeterminate: false,
    };

    if (hasOwnProperty(android.progress, 'indeterminate')) {
      if (!isBoolean(android.progress.indeterminate)) {
        throw new Error("'notification.android.progress.indeterminate' expected a boolean value.");
      }

      progress.indeterminate = android.progress.indeterminate;
    }

    out.progress = progress;
  }

  /**
   * remoteInputHistory
   */
  if (hasOwnProperty(android, 'remoteInputHistory')) {
    if (
      !isArray(android.remoteInputHistory) ||
      !isValidRemoteInputHistory(android.remoteInputHistory)
    ) {
      throw new Error(
        `'notification.android.remoteInputHistory' expected an array of string values.`,
      );
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
  if (hasOwnProperty(android, 'smallIcon')) {
    if (isArray(android.smallIcon)) {
      const [icon, level] = android.smallIcon;

      if (!isString(icon)) {
        throw new Error("'notification.android.smallIcon' expected icon to be a string.");
      }

      if (!isNumber(level) || level < 0) {
        throw new Error("'notification.android.smallIcon' expected level to be a positive number.");
      }

      out.smallIcon = [icon, level];
    } else if (isString(android.smallIcon)) {
      out.smallIcon = [android.smallIcon, -1];
    } else {
      throw new Error(
        "'notification.android.smallIcon' expected an array containing icon with level or string value.",
      );
    }
  }

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
   * ticker
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

    if (!isValidTimestamp(android.timeoutAfter)) {
      throw new Error(
        "'notification.android.timeoutAfter' invalid millisecond timestamp, date must be in the future.",
      );
    }

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
    if (!isArray(android.vibratePattern) || !isValidVibratePattern(android.vibratePattern)) {
      throw new Error(
        "'notification.android.vibratePattern' expected an array containing an even number of positive values.",
      );
    }

    out.vibratePattern = android.vibratePattern;
  }

  /**
   * when
   */
  if (hasOwnProperty(android, 'when')) {
    if (!isNumber(android.when)) {
      throw new Error("'notification.android.when' expected a number value.");
    }

    if (!isValidTimestamp(android.when)) {
      throw new Error(
        "'notification.android.when' invalid millisecond timestamp, date must be in the future.",
      );
    }

    out.when = android.when;
  }

  return out;
}
