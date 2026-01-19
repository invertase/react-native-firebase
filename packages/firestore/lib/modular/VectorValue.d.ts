/**
 * Represents a vector type in Firestore documents. Create an instance with vector().
 */
export declare class VectorValue {
  // Note the values array and constructor are not public APIs.

  /**
   * Builds a VectorValue instance from a JSON object created by VectorValue.toJSON().
   *
   * @param json a JSON object represention of a VectorValue instance.
   */
  static fromJSON(json: object): VectorValue;

  /**
   * Returns true if the two VectorValue values have the same raw number arrays, returns false otherwise.
   */
  isEqual(other: VectorValue): boolean;

  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray(): number[];

  /**
   * Returns a JSON-serializable representation of this VectorValue instance.
   */
  toJSON(): { values: number[] };
}

export declare function vector(values?: number[]): VectorValue;
