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

import { execute } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import type { Firestore } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestore';
import type {
  FirestorePipelineExecuteOptionsInternal,
  FirestorePipelineSerializedInternal,
  FirestorePipelineSnapshotInternal,
} from '../../types/internal';
import { validatePipelineExecuteRequest } from '../../pipelines/pipeline_validate';
import { buildWebSdkPipeline } from './pipeline_bridge_factory';
import type { WebPipelineInstance } from './pipeline_node_builder';
import { serializeWebSdkPipelineSnapshot } from './pipeline_snapshot_serializer';

async function executeWebSdkPipelineSnapshot(
  webSdkPipeline: WebPipelineInstance,
  _options?: FirestorePipelineExecuteOptionsInternal,
): Promise<unknown> {
  // The current web SDK execute() surface only accepts the pipeline instance.
  return execute(webSdkPipeline);
}

export async function executeWebSdkPipeline(
  firestore: Firestore,
  pipeline: FirestorePipelineSerializedInternal,
  options?: FirestorePipelineExecuteOptionsInternal,
): Promise<FirestorePipelineSnapshotInternal> {
  const request = validatePipelineExecuteRequest(pipeline, options);
  const webSdkPipeline = buildWebSdkPipeline(firestore, request);
  const rawSnapshot = await executeWebSdkPipelineSnapshot(webSdkPipeline, request.options);
  return serializeWebSdkPipelineSnapshot(rawSnapshot, request);
}
