/**
 * A `VectorValue` represents a vector in Firestore. The vector is a numeric array.ßßßß
 * @param values - The numeric values of the vector.
 * @returns A new VectorValue instance.
 */
export declare class VectorValue {
  readonly values: number[];
  constructor(values?: number[]);
  isEqual(other: VectorValue): boolean;
  toJSON(): { values: number[] };
}

export declare function vector(values?: number[]): VectorValue;
