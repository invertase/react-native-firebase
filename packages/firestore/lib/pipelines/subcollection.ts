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

import { isObject, isString } from '@react-native-firebase/app/dist/module/common';
import type { Pipeline } from './pipeline';
import type { SubcollectionStageOptions } from './stage_options';
import { createDetachedPipeline } from './pipeline_runtime';

function ensureNonEmptyString(path: unknown, method: string): string {
  if (!isString(path) || path.length === 0) {
    throw new Error(`subcollection(*) expected ${method} to be a non-empty string.`);
  }

  return path;
}

/**
 * @beta
 * Creates a pipeline targeted at a subcollection relative to the current document context.
 *
 * The returned pipeline has no database instance and cannot be executed directly.
 * Convert it with `toScalarExpression()` or `toArrayExpression()` and embed it in another pipeline.
 */
export function subcollection(path: string): Pipeline;

/**
 * @beta
 * Creates a pipeline targeted at a subcollection relative to the current document context.
 */
export function subcollection(options: SubcollectionStageOptions): Pipeline;

export function subcollection(pathOrOptions: string | SubcollectionStageOptions): Pipeline {
  if (isString(pathOrOptions)) {
    return createDetachedPipeline({
      source: 'subcollection',
      path: ensureNonEmptyString(pathOrOptions, 'path'),
    });
  }

  if (!isObject(pathOrOptions)) {
    throw new Error('subcollection(*) expected a path string or SubcollectionStageOptions object.');
  }

  const { path, rawOptions } = pathOrOptions as SubcollectionStageOptions;
  const normalizedPath = ensureNonEmptyString(path, 'path');

  return createDetachedPipeline({
    source: 'subcollection',
    path: normalizedPath,
    ...(rawOptions && isObject(rawOptions) ? { rawOptions } : {}),
  });
}
