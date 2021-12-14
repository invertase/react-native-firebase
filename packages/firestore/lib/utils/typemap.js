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

import { hasOwnProperty } from '@react-native-firebase/app/lib/common';

const MAP = {
  nan: 0,
  '-infinity': 1,
  infinity: 2,
  null: 3,
  documentid: 4, // to native only
  booleanTrue: 5,
  booleanFalse: 6,
  double: 7,
  string: 8,
  stringEmpty: 9,
  array: 10,
  reference: 11,
  geopoint: 12,
  timestamp: 13,
  blob: 14,
  fieldvalue: 15,
  object: 16,
  integer: 17,
  negativeZero: 18,
  unknown: -999,
};

const MAP_ENTRIES = Object.entries(MAP);

/**
 * Returns the array map with value for a given type
 * @param type
 * @param value
 * @returns {null|*[]}
 */
export function getTypeMapInt(type, value = undefined) {
  if (hasOwnProperty(MAP, type)) {
    const array = [MAP[type]];
    if (value !== undefined) {
      array.push(value);
    }
    return array;
  }

  return null;
}

/**
 * Returns the type of a given int value
 * @param value
 * @returns {null}
 */
export function getTypeMapName(value) {
  for (let i = 0; i < MAP_ENTRIES.length; i++) {
    const [name, int] = MAP_ENTRIES[i];
    if (value === int) {
      return name;
    }
  }

  return null;
}
