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

import { tryJSONParse, tryJSONStringify } from './index';
import { isObject } from './validate';

export function serializeType(value) {
  if (isObject(value)) {
    return {
      type: 'object',
      value: serializeObject(value),
    };
  }

  return {
    type: typeof value,
    value,
  };
}

export function serializeObject(object) {
  if (!isObject(object)) {
    return object;
  }

  // json stringify then parse it calls toString on Objects / Classes
  // that support it i.e new Date() becomes a ISO string.
  return tryJSONParse(tryJSONStringify(object));
}
