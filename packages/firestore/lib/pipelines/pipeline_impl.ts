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
import type { PipelineSnapshot } from './pipeline-result';
import type { PipelineExecuteOptions } from './pipeline_options';
import { executeRuntimePipeline } from './pipeline_runtime';

/**
 * @beta
 * Executes a pipeline and returns a Promise that resolves to the pipeline snapshot.
 *
 * @example
 * ```
 * const snapshot = await execute(
 *   firestore.pipeline().collection('books').where(gt(field('rating'), 4.5)).select('title', 'author', 'rating')
 * );
 * ```
 */
export function execute(pipeline: Pipeline): Promise<PipelineSnapshot>;

/**
 * @beta
 * Executes a pipeline with options.
 */
export function execute(options: PipelineExecuteOptions): Promise<PipelineSnapshot>;

export function execute(
  pipelineOrOptions: Pipeline | PipelineExecuteOptions,
): Promise<PipelineSnapshot> {
  return executeRuntimePipeline(pipelineOrOptions);
}
