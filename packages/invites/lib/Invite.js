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

import { isNumber, isString } from '@react-native-firebase/app/lib/common';
import AndroidInvitation from './AndroidInvite';

export default class Invitation {
  constructor(title, message) {
    this._message = message;
    this._title = title;
  }

  get android() {
    if (!this._android) {
      this._android = new AndroidInvitation(this);
    }
    return this._android;
  }

  setAndroidClientId(androidClientId) {
    if (!isString(androidClientId)) {
      throw new Error(
        "firebase.invites.Invite.setAndroidClientId(*) 'androidClientId' must be a string value.",
      );
    }

    this._androidClientId = androidClientId;
    return this;
  }

  setAndroidMinimumVersionCode(androidMinimumVersionCode) {
    if (!isNumber(androidMinimumVersionCode)) {
      throw new Error(
        "firebase.invites.Invite.setAndroidMinimumVersionCode(*) 'androidMinimumVersionCode' must be a number value.",
      );
    }

    this._androidMinimumVersionCode = androidMinimumVersionCode;
    return this;
  }

  setCallToActionText(callToActionText) {
    if (this._android && this._android._emailHtmlContent) {
      throw new Error(
        "firebase.invites.Invite.setCallToActionText(*) 'callToActionText' cannot be used alongside 'emailHtmlContent'.",
      );
    }

    if (!isString(callToActionText)) {
      throw new Error(
        "firebase.invites.Invite.setCallToActionText(*) 'callToActionText' must be a string value.",
      );
    }

    this._callToActionText = callToActionText;
    return this;
  }

  setCustomImage(customImage) {
    if (!isString(customImage)) {
      throw new Error(
        "firebase.invites.Invite.setCustomImage(*) 'customImage' must be a string value.",
      );
    }

    this._customImage = customImage;
    return this;
  }

  setDeepLink(deepLink) {
    if (!isString(deepLink)) {
      throw new Error("firebase.invites.Invite.setDeepLink(*) 'deepLink' must be a string value.");
    }

    this._deepLink = deepLink;
    return this;
  }

  setIOSClientId(iosClientId) {
    if (!isString(iosClientId)) {
      throw new Error(
        "firebase.invites.Invite.setIOSClientId(*) 'iosClientId' must be a string value.",
      );
    }

    this._iosClientId = iosClientId;
    return this;
  }

  build() {
    return {
      android: this._android ? this._android.build() : undefined,
      androidClientId: this._androidClientId,
      androidMinimumVersionCode: this._androidMinimumVersionCode,
      callToActionText: this._callToActionText,
      customImage: this._customImage,
      deepLink: this._deepLink,
      iosClientId: this._iosClientId,
      message: this._message,
      title: this._title,
    };
  }
}
