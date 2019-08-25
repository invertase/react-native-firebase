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

import { hasOwnProperty, isObject, isString } from '@react-native-firebase/app/lib/common';

export default function validateAndroidChannelGroup(group) {
  if (!isObject(group)) {
    throw new Error("'group' expected an object value.");
  }

  /**
   * channelGroupId
   */
  if (!isString(group.channelGroupId) || !group.channelGroupId) {
    throw new Error("'group.channelGroupId' expected a string value.");
  }

  /**
   * name
   */
  if (!isString(group.name) || !group.name) {
    throw new Error("'group.name' expected a string value.");
  }

  /**
   * Defaults
   */
  const out = {
    channelGroupId: group.channelGroupId,
    name: group.name,
  };

  /**
   * description
   */
  if (hasOwnProperty(group, 'description')) {
    if (!isString(group.description)) {
      throw new Error("'group.description' expected a string value.");
    }

    out.description = group.description;
  }

  return out;
}
