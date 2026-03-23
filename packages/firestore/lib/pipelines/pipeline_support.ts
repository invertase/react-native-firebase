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

import type {
  FirestorePipelineSerializedInternal,
  FirestorePipelineSerializedValueInternal,
} from '../types/internal';

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

// Keep this in sync with iOS native support in
// `RNFBFirestorePipelineNodeBuilder.swift`.
// Remove entries once the iOS node builder/runtime path supports them.
const IOS_UNSUPPORTED_FUNCTION_NAMES = new Set<string>([
  'arrayGet',
  'arrayConcat',
  'ceil',
  'conditional',
  'concat',
  'floor',
  'isType',
  'length',
  'logicalMaximum',
  'logicalMinimum',
  'log10',
  'ltrim',
  'rand',
  'round',
  'rtrim',
  'split',
  'sqrt',
  'stringIndexOf',
  'stringRepeat',
  'stringReplaceAll',
  'stringReplaceOne',
  'substring',
  'timestampAdd',
  'timestampSubtract',
  'timestampTruncate',
  'trunc',
  'unixMillisToTimestamp',
]);

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

export function getIOSUnsupportedPipelineFunctions(
  pipeline?: FirestorePipelineSerializedInternal | null,
): string[] {
  if (!pipeline) {
    return [];
  }

  const unsupported = new Set<string>();
  collectIOSUnsupportedFunctions(
    pipeline as unknown as FirestorePipelineSerializedValueInternal,
    unsupported,
  );
  return Array.from(unsupported).sort();
}

function collectIOSUnsupportedFunctions(
  value: FirestorePipelineSerializedValueInternal,
  unsupported: Set<string>,
): void {
  if (Array.isArray(value)) {
    value.forEach(entry => collectIOSUnsupportedFunctions(entry, unsupported));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const objectValue = value as Record<string, unknown>;

  if (isSerializedFunctionExpression(objectValue)) {
    if (IOS_UNSUPPORTED_FUNCTION_NAMES.has(objectValue.name)) {
      unsupported.add(objectValue.name);
    }

    if (Array.isArray(objectValue.args)) {
      objectValue.args.forEach(entry => collectIOSUnsupportedFunctions(entry, unsupported));
    }
  }

  Object.values(objectValue).forEach(entry => {
    collectIOSUnsupportedFunctions(entry as FirestorePipelineSerializedValueInternal, unsupported);
  });
}

function isSerializedFunctionExpression(
  value: Record<string, unknown>,
): value is { name: string; args?: FirestorePipelineSerializedValueInternal[] } {
  return (
    typeof value.name === 'string' &&
    (value.exprType === 'Function' || value.__kind === 'expression')
  );
}
