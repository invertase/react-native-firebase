/*
 * Minimal declarations for FirestoreAggregate (JS) until migration.
 */
import type FirestoreQuery from './FirestoreQuery';
import type FirestoreQueryModifiers from './FirestoreQueryModifiers';
import type FirestorePath from './FirestorePath';

export class FirestoreAggregateQuery {
  constructor(
    firestore: unknown,
    query: FirestoreQuery,
    collectionPath: FirestorePath,
    modifiers: FirestoreQueryModifiers,
  );
  get query(): FirestoreQuery;
  get(): Promise<unknown>;
}

export class FirestoreAggregateQuerySnapshot {
  constructor(query: FirestoreQuery, data: unknown, isGetCountFromServer: boolean);
  data(): { count?: number; [key: string]: unknown };
}

export const AggregateType: { SUM: string; AVG: string; COUNT: string };

export class AggregateField {
  aggregateType: string;
  constructor(aggregateType: string, fieldPath?: unknown);
}

export function fieldPathFromArgument(path: unknown): unknown;
