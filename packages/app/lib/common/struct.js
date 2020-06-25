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

import { superstruct } from 'superstruct/lib/index';
import { isUndefined } from './validate';

export default superstruct({
  types: {
    shortDate: value => typeof value === 'string' && !!value.match(/^\d{4}-\d{2}-\d{2}$/),
  },
});

export const validateStruct = (value = {}, struct, prefix = '') => {
  try {
    return struct(value);
  } catch (e) {
    const { path, reason } = e;
    const key = path[0];

    if (reason === undefined) {
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
