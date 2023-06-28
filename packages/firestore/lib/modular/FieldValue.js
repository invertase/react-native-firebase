import FirestoreFieldValue from '../FirestoreFieldValue';

export const FieldValue = FirestoreFieldValue;

/**
 * @returns {FieldValue}
 */
export function deleteField() {
  return FieldValue.delete();
}

/**
 * @returns {FieldValue}
 */
export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}

/**
 * @param {unknown} elements
 * @returns {FieldValue}
 */
export function arrayUnion(...elements) {
  return FieldValue.arrayUnion(...elements);
}

/**
 * @param {unknown} elements
 * @returns {FieldValue}
 */
export function arrayRemove(...elements) {
  return FieldValue.arrayRemove(...elements);
}

/**
 * @param {number} n
 * @returns {FieldValue}
 */
export function increment(n) {
  return FieldValue.increment(n);
}
