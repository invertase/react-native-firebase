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
  isBoolean,
  isNumber,
  isObject,
} from '@react-native-firebase/app/lib/common';
import AndroidRepeatInterval from './AndroidRepeatInterval';

export default function validateSchedule(schedule) {
  if (!isObject(schedule)) {
    throw new Error("'schedule' expected an object value.");
  }

  if (!isNumber(schedule.fireDate)) {
    throw new Error("'schedule.fireDate' expected a number value.");
  }

  const now = Date.now();

  if (schedule.fireDate <= now) {
    throw new Error("'schedule.fireDate' date must be in the future.");
  }

  const out = {
    fireDate: schedule.fireDate,
    exact: false,
  };

  if (hasOwnProperty(schedule, 'exact')) {
    if (!isBoolean(schedule.exact)) {
      throw new Error("'schedule.exact' expected a boolean value.");
    }

    out.exact = schedule.exact;
  }

  if (hasOwnProperty(schedule, 'repeatInterval')) {
    if (
      schedule.repeatInterval !== AndroidRepeatInterval.MINUTE ||
      schedule.repeatInterval !== AndroidRepeatInterval.HOUR ||
      schedule.repeatInterval !== AndroidRepeatInterval.DAY ||
      schedule.repeatInterval !== AndroidRepeatInterval.WEEK
    ) {
      throw new Error("'schedule.repeatInterval' expected a valid AndroidRepeatInterval.");
    }

    out.repeatInterval = schedule.repeatInterval;
  }

  return out;
}
