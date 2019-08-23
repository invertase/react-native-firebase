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

export default function validateAndroidChannel(channel) {
  if (!isObject(channel)) {
    throw new Error("'channel' expected an object value.");
  }

  /**
   * channelId
   */
  if (!isString(channel.channelId)) {
    throw new Error("'channel.channelId' expected a string value.");
  }

  // empty check
  if (!channel.channelId) {
    throw new Error("'channel.channelId' expected a valid string channelId.");
  }

  /**
   * name
   */
  if (!isString(channel.name)) {
    throw new Error("'channel.name' expected a string value.");
  }

  // empty check
  if (!channel.name) {
    throw new Error("'channel.name' expected a valid channel name.");
  }

  /**
   * Defaults
   */
  const out = {
    channelId: channel.channelId,
    name: channel.name,
    allowBubbles: false,
    bypassDnd: false,
    enableLights: true,
    enableVibration: true,
    showBadge: false,
  };

  /**
   * allowBubbles
   */
  if (hasOwnProperty(channel, 'allowBubbles')) {
    if (!isBoolean(channel.allowBubbles)) {
      throw new Error("'channel.allowBubbles' expected a boolean value.");
    }

    out.allowBubbles = channel.allowBubbles;
  }

  /**
   * bypassDnd
   */
  if (hasOwnProperty(channel, 'bypassDnd')) {
    if (!isBoolean(channel.bypassDnd)) {
      throw new Error("'channel.bypassDnd' expected a boolean value.");
    }

    out.bypassDnd = channel.bypassDnd;
  }

  /**
   * description
   */
  if (hasOwnProperty(channel, 'description')) {
    if (!isString(channel.description)) {
      throw new Error("'channel.description' expected a string value.");
    }

    out.description = channel.description;
  }

  /**
   * enableLights
   */
  if (hasOwnProperty(channel, 'enableLights')) {
    if (!isBoolean(channel.enableLights)) {
      throw new Error("'channel.enableLights' expected a boolean value.");
    }

    out.enableLights = channel.enableLights;
  }

  /**
   * enableVibration
   */
  if (hasOwnProperty(channel, 'enableVibration')) {
    if (!isBoolean(channel.enableVibration)) {
      throw new Error("'channel.enableVibration' expected a boolean value.");
    }

    out.enableVibration = channel.enableVibration;
  }

  /**
   * groupId
   */
  if (hasOwnProperty(channel, 'groupId')) {
    if (!isString(channel.groupId)) {
      throw new Error("'channel.groupId' expected a string value.");
    }

    out.groupId = channel.groupId;
  }

  /**
   * importance
   */
  if (hasOwnProperty(channel, 'importance')) {
    // todo importance

    out.importance = channel.importance;
  }

  /**
   * lightColor
   */
  if (hasOwnProperty(channel, 'lightColor')) {
    // todo lightColor

    out.lightColor = channel.lightColor;
  }

  /**
   * lockscreenVisibility
   */
  if (hasOwnProperty(channel, 'lockscreenVisibility')) {
    // todo lockscreenVisibility / default

    out.lockscreenVisibility = channel.lockscreenVisibility;
  }

  /**
   * showBadge
   */
  if (hasOwnProperty(channel, 'showBadge')) {
    if (!isBoolean(channel.showBadge)) {
      throw new Error("'channel.showBadge' expected a boolean value.");
    }

    out.showBadge = channel.showBadge;
  }

  /**
   * sound
   */
  if (hasOwnProperty(channel, 'sound')) {
    // todo sound

    out.sound = channel.sound;
  }

  /**
   * vibrationPattern
   */
  if (hasOwnProperty(channel, 'vibrationPattern')) {
    if (!isArray(channel.vibrationPattern)) {
      throw new Error("'channel.vibrationPattern' expected an array.");
    }

    // todo common
    for (let i = 0; i < channel.vibrationPattern.length; i++) {
      if (!isNumber(channel.vibrationPattern[i])) {
        throw new Error("'channel.vibrationPattern' invalid pattern, expected all values to be numbers.");
      }
    }

    out.vibrationPattern = channel.vibrationPattern;
  }

  return out;
}
