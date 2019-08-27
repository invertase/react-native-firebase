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
import AndroidStyle from './AndroidStyle';
import AndroidDefaults from './AndroidDefaults';

import {
  isValidColor,
  isValidLightPattern,
  isValidRemoteInputHistory,
  isValidTimestamp,
  isValidVibratePattern,
} from './validate';

import validateAndroidAction from './validateAndroidAction';
import {
  validateAndroidBigPictureStyle,
  validateAndroidBigTextStyle,
} from './validateAndroidStyle';

export default function validateAndroidNotification(android) {
  const out = {
    autoCancel: true,
    badgeIconType: AndroidBadgeIconType.NONE,
    colorized: false,
    channelId: '',
    groupAlertBehavior: AndroidGroupAlertBehavior.ALL,
    groupSummary: false,
    localOnly: false,
    ongoing: false,
    onlyAlertOnce: false,
    priority: AndroidPriority.DEFAULT,
    showWhenTimestamp: false,
    smallIcon: ['ic_launcher', -1],
    sound: 'default',
    usesChronometer: false,
    visibility: AndroidVisibility.PRIVATE,
  };

  if (isUndefined(android)) {
    return out;
  }

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

    const actions = [];
    try {
      for (let i = 0; i < android.actions.length; i++) {
        actions.push(validateAndroidAction(android.actions[i]));
      }
    } catch (e) {
      throw new Error(`'notification.android.actions' invalid AndroidAction. ${e.message}.`);
    }

    if (actions.length) {
      out.actions = android.actions;
    }
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
    if (!Object.values(AndroidBadgeIconType).includes(android.badgeIconType)) {
      throw new Error(
        "'notification.android.badgeIconType' expected a valid AndroidBadgeIconType.",
      );
    }

    out.badgeIconType = android.badgeIconType;
  }

  /**
   * category
   */
  if (hasOwnProperty(android, 'category')) {
    if (!Object.values(AndroidCategory).includes(android.category)) {
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

    const defaults = Object.values(AndroidDefaults);

    for (let i = 0; i < android.defaults.length; i++) {
      if (!defaults.includes(android.defaults[i])) {
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
   * groupAlertBehavior
   */
  if (hasOwnProperty(android, 'groupAlertBehavior')) {
    if (!Object.values(AndroidGroupAlertBehavior).includes(android.groupAlertBehavior)) {
      throw new Error(
        "'notification.android.groupAlertBehavior' expected a valid AndroidGroupAlertBehavior.",
      );
    }

    out.groupAlertBehavior = android.groupAlertBehavior;
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

    const [valid, property] = isValidLightPattern(android.lights);

    if (!valid) {
      switch (property) {
        case 'color':
          throw new Error(
            "'notification.android.lights' invalid color. Expected an AndroidColor or hexadecimal string value.",
          );
        case 'onMs':
          throw new Error(
            '\'notification.android.lights\' invalid "on" millisecond value, expected a number greater than 0.',
          );
        case 'offMs':
          throw new Error(
            '\'notification.android.lights\' invalid "off" millisecond value, expected a number greater than 0.',
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
    if (!isBoolean(android.onlyAlertOnce)) {
      throw new Error("'notification.android.onlyAlertOnce' expected a boolean value.");
    }

    out.onlyAlertOnce = android.onlyAlertOnce;
  }

  /**
   * priority
   */
  if (hasOwnProperty(android, 'priority')) {
    if (!Object.values(AndroidPriority).includes(android.priority)) {
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
        "'notification.android.remoteInputHistory' expected an array of string values.",
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

      if (!isString(icon) || !icon) {
        throw new Error("'notification.android.smallIcon' expected icon to be a string.");
      }

      if (!isNumber(level) || level < 0) {
        throw new Error("'notification.android.smallIcon' expected level to be a positive number.");
      }

      out.smallIcon = [icon, level];
    } else if (isString(android.smallIcon) || !android.smallIcon) {
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
   * style
   */

  if (hasOwnProperty(android, 'style')) {
    if (!isObject(android.style)) {
      throw new Error("'notification.android.style' expected an object value.");
    }

    switch (android.style.type) {
      case AndroidStyle.BIGPICTURE:
        out.style = validateAndroidBigPictureStyle(android.style);
        break;
      case AndroidStyle.BIGTEXT:
        out.style = validateAndroidBigTextStyle(android.style);
        break;
      default:
        throw new Error(
          "'notification.android.style' style type must be one of AndroidStyle.BIGPICTURE or AndroidStyle.BIGTEXT.",
        );
    }
  }

  /**
   * tag
   */
  if (hasOwnProperty(android, 'tag')) {
    if (!isString(android.tag)) {
      throw new Error("'notification.android.tag' expected a string value.");
    }

    if (android.tag.includes('|')) {
      throw new Error(`'notification.android.tag' tag cannot contain the "|" (pipe) character.`);
    }

    out.tag = android.tag;
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
      throw new Error("'notification.android.timeoutAfter' invalid millisecond timestamp.");
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
   * vibrationPattern
   */
  if (hasOwnProperty(android, 'vibrationPattern')) {
    if (!isArray(android.vibrationPattern) || !isValidVibratePattern(android.vibrationPattern)) {
      throw new Error(
        "'notification.android.vibrationPattern' expected an array containing an even number of positive values.",
      );
    }

    out.vibrationPattern = android.vibrationPattern;
  }

  /**
   * visibility
   */
  if (hasOwnProperty(android, 'visibility')) {
    if (!Object.values(AndroidVisibility).includes(android.visibility)) {
      throw new Error(
        "'notification.android.visibility' expected a valid AndroidVisibility value.",
      );
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

    if (!isValidTimestamp(android.when)) {
      throw new Error(
        "'notification.android.when' invalid millisecond timestamp, date must be in the future.",
      );
    }

    out.when = android.when;
  }

  return out;
}
