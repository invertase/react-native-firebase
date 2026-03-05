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
  isFinite,
  isNumber,
  isUndefined,
  isObject,
} from '@react-native-firebase/app/dist/module/common';

export default class GeoPoint {
  _latitude: number;
  _longitude: number;

  constructor(latitude: number, longitude: number) {
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
        `firebase.firestore.GeoPoint 'latitude' must be a number between -90 and 90, but was: ${latitude}.`,
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

  get latitude(): number {
    return this._latitude;
  }

  get longitude(): number {
    return this._longitude;
  }

  isEqual(other: GeoPoint): boolean {
    if (!(other instanceof GeoPoint)) {
      throw new Error(
        "firebase.firestore.GeoPoint.isEqual(*) 'other' expected an instance of GeoPoint.",
      );
    }

    return this._latitude === other._latitude && this._longitude === other._longitude;
  }

  _compareTo(other: GeoPoint): number {
    if (this._latitude < other._latitude) return -1;
    if (this._latitude > other._latitude) return 1;
    if (this._longitude < other._longitude) return -1;
    if (this._longitude > other._longitude) return 1;
    return 0;
  }

  static _jsonSchemaVersion: string = 'firestore/geoPoint/1.0';
  static _jsonSchema = {
    type: GeoPoint._jsonSchemaVersion,
    latitude: 'number',
    longitude: 'number',
  };

  toJSON(): { latitude: number; longitude: number; type: string } {
    return {
      latitude: this._latitude,
      longitude: this._longitude,
      type: GeoPoint._jsonSchemaVersion,
    };
  }

  static fromJSON(json: object): GeoPoint {
    if (
      isObject(json) &&
      (json as { type?: unknown }).type === GeoPoint._jsonSchemaVersion &&
      typeof (json as { latitude?: unknown }).latitude === 'number' &&
      typeof (json as { longitude?: unknown }).longitude === 'number'
    ) {
      return new GeoPoint(
        (json as { latitude: number }).latitude,
        (json as { longitude: number }).longitude,
      );
    }

    throw new Error('Unexpected error creating GeoPoint from JSON.');
  }
}
