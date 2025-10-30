import FirestoreVectorValue from '../FirestoreVectorValue';

export const VectorValue = FirestoreVectorValue;

/**
 * @param {number[]=} values
 * @returns {VectorValue}
 */
export function vector(values) {
  return new VectorValue(values);
}
