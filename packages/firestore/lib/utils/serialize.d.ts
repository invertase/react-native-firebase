/*
 * Minimal declarations for utils/serialize (JS) until Task 9 migration.
 */
export function provideDocumentReferenceClass(documentReference: unknown): void;
export function provideFieldValueClass(fieldValue: unknown): void;
export function buildNativeMap(data: unknown, ignoreUndefined?: boolean): Record<string, unknown>;
export function buildNativeArray(array: unknown[], ignoreUndefined?: boolean): unknown[];
export function generateNativeData(value: unknown, ignoreUndefined?: boolean): unknown;
export function parseNativeMap(
  firestore: unknown,
  nativeData: unknown,
): Record<string, unknown> | undefined;
export function parseNativeArray(firestore: unknown, nativeArray: unknown[]): unknown[];
export function parseNativeData(firestore: unknown, nativeArray: unknown): unknown;
