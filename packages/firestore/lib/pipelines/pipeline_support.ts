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

import type { FirestorePipelineSerializedInternal } from '../types/internal';

export const PIPELINE_SOURCE_TYPES = [
  'collection',
  'collectionGroup',
  'database',
  'documents',
  'query',
] as const;

export const PIPELINE_STAGE_TYPES = [
  'where',
  'select',
  'addFields',
  'removeFields',
  'sort',
  'limit',
  'offset',
  'aggregate',
  'distinct',
  'findNearest',
  'replaceWith',
  'sample',
  'union',
  'unnest',
  'rawStage',
] as const;

export const PIPELINE_UNSUPPORTED_BASE_MESSAGE =
  'Firestore pipelines are not supported by this native implementation yet.';

export function createPipelineUnsupportedMessage(
  pipeline?: FirestorePipelineSerializedInternal | null,
): string {
  const firstStage = pipeline?.stages?.[0];
  if (firstStage?.stage && typeof firstStage.stage === 'string') {
    return `${PIPELINE_UNSUPPORTED_BASE_MESSAGE} Unsupported stage: ${firstStage.stage}.`;
  }

  const source = pipeline?.source?.source;
  if (source && typeof source === 'string') {
    return `${PIPELINE_UNSUPPORTED_BASE_MESSAGE} Unsupported source: ${source}.`;
  }

  return PIPELINE_UNSUPPORTED_BASE_MESSAGE;
}
