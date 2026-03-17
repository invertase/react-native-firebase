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

import type { Pipeline } from './pipeline';
import type { StageOptions } from './stage_options';

/**
 * @beta
 * Options for pipeline execute().
 *
 * Note: `indexMode` and `rawOptions` are currently applied on Android and web only. iOS rejects
 * them because the native Firestore pipeline SDK does not yet expose execute options.
 */
export interface PipelineExecuteOptions extends StageOptions {
  pipeline: Pipeline;
  indexMode?: 'recommended';
  rawOptions?: { [name: string]: unknown };
}
