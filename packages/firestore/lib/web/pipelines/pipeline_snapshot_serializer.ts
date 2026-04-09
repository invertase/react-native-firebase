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
  FirestorePipelineResultInternal,
  FirestorePipelineSnapshotInternal,
  FirestorePipelineTimestampInternal,
} from '../../types/internal';
import type { WebParsedPipelineRequest } from './pipeline_parser';
import { objectToWriteable } from '../convert';

const METADATA_FALLBACK_STAGES = new Set(['select', 'addFields', 'removeFields']);

interface PipelineExecutionMetadata {
  sourceDocumentPaths: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function serializeTimestamp(value: unknown): FirestorePipelineTimestampInternal | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (isRecord(value)) {
    if (typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
      return {
        seconds: value.seconds,
        nanoseconds: value.nanoseconds,
      };
    }

    if (typeof value.toMillis === 'function') {
      return (value.toMillis as () => number)();
    }
  }

  return undefined;
}

function buildExecutionMetadata(request: WebParsedPipelineRequest): PipelineExecutionMetadata {
  if (
    request.pipeline.source.source === 'documents' &&
    request.pipeline.source.documents.length > 0 &&
    request.pipeline.stages.every(stage => METADATA_FALLBACK_STAGES.has(stage.stage))
  ) {
    return {
      sourceDocumentPaths: request.pipeline.source.documents,
    };
  }

  return {
    sourceDocumentPaths: [],
  };
}

function getFallbackPath(
  metadata: PipelineExecutionMetadata,
  index: number,
  resultCount: number,
): string | undefined {
  if (
    metadata.sourceDocumentPaths.length === 0 ||
    metadata.sourceDocumentPaths.length !== resultCount ||
    index < 0 ||
    index >= metadata.sourceDocumentPaths.length
  ) {
    return undefined;
  }

  return metadata.sourceDocumentPaths[index];
}

function serializePipelineResult(
  result: unknown,
  fallbackPath?: string,
): FirestorePipelineResultInternal {
  const resultRecord = isRecord(result) ? result : {};
  const ref = isRecord(resultRecord.ref) ? resultRecord.ref : undefined;
  const path = typeof ref?.path === 'string' ? ref.path : fallbackPath;
  const rawData = typeof resultRecord.data === 'function' ? resultRecord.data() : resultRecord.data;
  const idFromPath = path ? path.split('/').pop() : undefined;

  return {
    data: isRecord(rawData) ? objectToWriteable(rawData) : undefined,
    path,
    id: typeof resultRecord.id === 'string' ? resultRecord.id : idFromPath,
    createTime: serializeTimestamp(resultRecord.createTime),
    updateTime: serializeTimestamp(resultRecord.updateTime),
  };
}

export function serializeWebSdkPipelineSnapshot(
  rawSnapshot: unknown,
  request: WebParsedPipelineRequest,
): FirestorePipelineSnapshotInternal {
  const metadata = buildExecutionMetadata(request);
  const snapshotRecord = isRecord(rawSnapshot) ? rawSnapshot : {};
  const rawResults = Array.isArray(snapshotRecord.results) ? snapshotRecord.results : [];
  const results = rawResults.map((result, index) =>
    serializePipelineResult(result, getFallbackPath(metadata, index, rawResults.length)),
  );

  const executionTime = serializeTimestamp(snapshotRecord.executionTime);
  if (!executionTime) {
    throw new Error('pipelineExecute() expected the web SDK snapshot to include executionTime.');
  }

  return {
    results,
    executionTime,
  };
}
