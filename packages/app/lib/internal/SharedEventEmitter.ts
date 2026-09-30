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

// RN macOS 0.78 does not export EventEmitter from the public API; vendor path works on 0.78–0.88.
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type { ReactNativeFirebaseEventEmitter } from '../types/internal';

const emitter = new EventEmitter() as ReactNativeFirebaseEventEmitter;

export default emitter;
