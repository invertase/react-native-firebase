/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { isUndefined } from '@react-native-firebase/app/lib/common/validate';
import { create } from 'superstruct';

export const validateStruct = (value = {}, struct, prefix = '') => {
  //skip superstruct create in prod. has  high impact on perf if a called a lot.
  if(!__DEV__) {
    return value;
  }
  
  try {
    return create(value, struct);
  } catch (e) {
    const { path, message } = e;

    const key = path[0];

    if (message === undefined) {
      throw new Error(`${prefix} unknown property '${key}'.`);
    }
    e.message = `${prefix} ${e.message}`;

    throw e;
  }
};

export const validateCompound = (source = {}, a, b, prefix = '') => {
  if (
    (isUndefined(source[a]) && !isUndefined(source[b])) ||
    (!isUndefined(source[a]) && isUndefined(source[b]))
  ) {
    throw new Error(
      `${prefix} if you supply the '${a}' parameter, you must also supply the '${b}' parameter.`,
    );
  }
};
