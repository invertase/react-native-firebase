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

import { isFinite, isNumber, isUndefined } from '@react-native-firebase/app/lib/common';

export default class FirestoreGeoPoint {
  constructor(latitude, longitude) {
    if (isUndefined(latitude) || isUndefined(longitude)) {
      throw new Error(
        'firebase.firestore.GeoPoint constructor expected latitude and longitude values.',
      );
    }

    if (!isNumber(latitude)) {
      throw new Error("firebase.firestore.GeoPoint 'latitude' must be a number value.");
    }

    if (!isNumber(longitude)) {
      throw new Error("firebase.firestore.GeoPoint 'longitude' must be a number value.");
    }

    if (!isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new Error(
        `firebase.firestore.GeoPoint 'longitude' must be a number between -90 and 90, but was: ${latitude}.`,
      );
    }

    if (!isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error(
        `firebase.firestore.GeoPoint 'longitude' must be a number between -180 and 180, but was: ${longitude}.`,
      );
    }

    this._latitude = latitude;
    this._longitude = longitude;
  }

  get latitude() {
    return this._latitude;
  }

  get longitude() {
    return this._longitude;
  }

  isEqual(other) {
    if (!(other instanceof FirestoreGeoPoint)) {
      throw new Error(
        "firebase.firestore.GeoPoint.isEqual(*) 'other' expected an instance of GeoPoint.",
      );
    }

    return this._latitude === other._latitude && this._longitude === other._longitude;
  }
}
