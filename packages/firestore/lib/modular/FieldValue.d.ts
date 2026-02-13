/**
 * Sentinel values that can be used when writing document fields with `set()`
 * or `update()`.
 */
export declare class FieldValue {
  isEqual(other: FieldValue): boolean;
}

/**
 * Returns a sentinel for use with `updateDoc` or
 * `setDoc` with `{merge: true}` to mark a field for deletion.
 */
export function deleteField(): FieldValue;

/**
 * Returns a sentinel used with `setDoc` or `updateDoc` to
 * include a server-generated timestamp in the written data.
 */
export function serverTimestamp(): FieldValue;

/**
 * Returns a special value that can be used with `setDoc` or
 * `updateDoc` that tells the server to union the given elements with any array
 * value that already exists on the server. Each specified element that doesn't
 * already exist in the array will be added to the end. If the field being
 * modified is not already an array it will be overwritten with an array
 * containing exactly the specified elements.
 *
 * @param elements - The elements to union into the array.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`.
 */
export function arrayUnion(...elements: unknown[]): FieldValue;

/**
 * Returns a special value that can be used with `setDoc` or
 * `updateDoc` that tells the server to remove the given elements from any
 * array value that already exists on the server. All instances of each element
 * specified will be removed from the array. If the field being modified is not
 * already an array it will be overwritten with an empty array.
 *
 * @param elements - The elements to remove from the array.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`
 */
export function arrayRemove(...elements: unknown[]): FieldValue;

/**
 * Returns a special value that can be used with `setDoc` or
 * `updateDoc` that tells the server to increment the field's current value by
 * the given value.
 *
 * If either the operand or the current field value uses floating point
 * precision, all arithmetic follows IEEE 754 semantics. If both values are
 * integers, values outside of JavaScript's safe number range
 * (`Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`) are also subject to
 * precision loss. Furthermore, once processed by the Firestore backend, all
 * integer operations are capped between `-2^63` and `2^63-1`.
 *
 * If the current field value is not of type `number`, or if the field does not
 * yet exist, the transformation sets the field to the given value.
 *
 * @param n - The value to increment by.
 * @returns The `FieldValue` sentinel for use in a call to `setDoc()` or
 * `updateDoc()`
 */
export function increment(n: number): FieldValue;
