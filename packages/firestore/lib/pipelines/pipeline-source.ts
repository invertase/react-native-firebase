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

import type { CollectionReference, DocumentReference, Query } from '../types/firestore';
import type { Pipeline } from './pipeline';

/**
 * @beta
 * Source stage options for collection.
 *
 * Note: `rawOptions` are currently applied on Android and web only. iOS rejects them because the
 * native Firestore pipeline SDK does not yet expose collection source options.
 */
export interface PipelineCollectionSourceOptions {
  path?: string;
  collectionRef?: CollectionReference;
  rawOptions?: { [name: string]: unknown };
}

/**
 * @beta
 * Source stage options for collectionGroup.
 *
 * Note: `rawOptions` are currently applied on Android and web only. iOS rejects them because the
 * native Firestore pipeline SDK does not yet expose collection group source options.
 */
export interface PipelineCollectionGroupSourceOptions {
  collectionId?: string;
  rawOptions?: { [name: string]: unknown };
}

/**
 * @beta
 * Source stage options for database.
 *
 * Note: `rawOptions` are currently applied on Android and web only. iOS rejects them because the
 * native Firestore pipeline SDK does not yet expose database source options.
 */
export interface PipelineDatabaseSourceOptions {
  rawOptions?: { [name: string]: unknown };
}

/**
 * @beta
 * Source stage options for documents.
 */
export interface PipelineDocumentsSourceOptions {
  docs?: Array<string | DocumentReference>;
}

/**
 * @beta
 * PipelineSource defines the input for a pipeline. Call exactly one of collection, collectionGroup, database, documents, or createFrom.
 */
export interface PipelineSource<TPipeline extends Pipeline = Pipeline> {
  collection(path: string): TPipeline;
  collection(collectionRef: CollectionReference): TPipeline;
  collection(options: PipelineCollectionSourceOptions): TPipeline;

  collectionGroup(collectionId: string): TPipeline;
  collectionGroup(options: PipelineCollectionGroupSourceOptions): TPipeline;

  database(options?: PipelineDatabaseSourceOptions): TPipeline;

  documents(docs: Array<string | DocumentReference>): TPipeline;
  documents(options: PipelineDocumentsSourceOptions): TPipeline;

  createFrom(query: Query): TPipeline;
}
