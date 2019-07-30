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

import { isString, objectKeyValuesAreStrings } from '@react-native-firebase/common';

export default class AndroidInvitation {
  constructor(invite) {
    this._invite = invite;
  }

  setAdditionalReferralParameters(additionalReferralParameters) {
    if (!objectKeyValuesAreStrings(additionalReferralParameters)) {
      throw new Error(
        "firebase.invites.AndroidInvite.setAdditionalReferralParameters(*) 'additionalReferralParameters' must be an object of string keys and values.",
      );
    }

    this._additionalReferralParameters = additionalReferralParameters;
    return this._invite;
  }

  setEmailHtmlContent(emailHtmlContent) {
    if (this._invite._callToActionText) {
      throw new Error(
        "firebase.invites.AndroidInvite.setEmailHtmlContent(*) 'emailHtmlContent' cannot be used alongside 'callToActionText'.",
      );
    }

    if (!isString(emailHtmlContent)) {
      throw new Error(
        "firebase.invites.AndroidInvite.setEmailHtmlContent(*) 'emailHtmlContent' must be a string value.",
      );
    }

    this._emailHtmlContent = emailHtmlContent;
    return this._invite;
  }

  setEmailSubject(emailSubject) {
    if (!isString(emailSubject)) {
      throw new Error(
        "firebase.invites.AndroidInvite.setEmailSubject(*) 'emailSubject' must be a string value.",
      );
    }

    this._emailSubject = emailSubject;
    return this._invite;
  }

  setGoogleAnalyticsTrackingId(googleAnalyticsTrackingId) {
    if (!isString(googleAnalyticsTrackingId)) {
      throw new Error(
        "firebase.invites.AndroidInvite.setGoogleAnalyticsTrackingId(*) 'googleAnalyticsTrackingId' must be a string value.",
      );
    }

    this._googleAnalyticsTrackingId = googleAnalyticsTrackingId;
    return this._invite;
  }

  build() {
    return {
      additionalReferralParameters: this._additionalReferralParameters,
      emailHtmlContent: this._emailHtmlContent,
      emailSubject: this._emailSubject,
      googleAnalyticsTrackingId: this._googleAnalyticsTrackingId,
    };
  }
}
