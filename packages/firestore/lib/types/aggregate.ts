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

import type { FieldPath } from '../modular/FieldPath';

export type AggregateType = 'count' | 'avg' | 'sum';

export interface AggregateFieldLike<T = unknown> {
  readonly type: 'AggregateField';
  aggregateType: AggregateType;
  readonly _internalFieldPath?: FieldPath;
}

export type AggregateFieldType = AggregateFieldLike<number> | AggregateFieldLike<number | null>;

export interface AggregateSpec {
  [field: string]: AggregateFieldType;
}

export type AggregateSpecData<T extends AggregateSpec> = {
  [P in keyof T]: T[P] extends AggregateFieldLike<infer U> ? U : never;
};
