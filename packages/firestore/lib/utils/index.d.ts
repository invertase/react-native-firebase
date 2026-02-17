/*
 * Minimal declarations for utils (JS) until Task 9 migration.
 */
export function extractFieldPathData(data: unknown, segments: string[]): unknown;
export function parseUpdateArgs(args: unknown[]): Record<string, unknown>;
export function parseSetOptions(options?: unknown): Record<string, unknown>;
export function applyFirestoreDataConverter(
  data: unknown,
  converter: unknown,
  options?: unknown,
): unknown;
export function parseSnapshotArgs(args: unknown[]): {
  snapshotListenOptions: { includeMetadataChanges?: boolean };
  callback: (snapshot: unknown, error: Error | null) => void;
  onNext: (snapshot: unknown) => void;
  onError: (error: Error) => void;
};
export function validateWithConverter(converter: unknown): void;
