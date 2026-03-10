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

import type { DocumentData, DocumentReference } from '../types/firestore';
import type Timestamp from '../FirestoreTimestamp';
import type { Field } from './expressions';

/**
 * @beta
 * Result of running a pipeline. One per document (or per group with aggregation, or single for global aggregation).
 */
export interface PipelineResult<T = DocumentData> {
  data(): T;
  get(fieldPath: string | import('../modular/FieldPath').FieldPath | Field): unknown;
  readonly ref?: DocumentReference;
  readonly id?: string;
  readonly createTime?: Timestamp;
  readonly updateTime?: Timestamp;
}

/**
 * @beta
 * Snapshot returned from `execute(pipeline)`.
 */
export interface PipelineSnapshot<T = DocumentData> {
  readonly results: PipelineResult<T>[];
  readonly executionTime: Timestamp;
}

/**
 * @beta
 * Compares two pipeline results for equality.
 */
export function pipelineResultEqual(
  _left: PipelineResult,
  _right: PipelineResult,
): boolean {
  return false;
}
