/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Contains the list of OpenAPI data types
 * as defined by the
 * {@link https://swagger.io/docs/specification/data-models/data-types/ | OpenAPI specification}
 * @public
 */
export enum SchemaType {
  /** String type. */
  STRING = 'string',
  /** Number type. */
  NUMBER = 'number',
  /** Integer type. */
  INTEGER = 'integer',
  /** Boolean type. */
  BOOLEAN = 'boolean',
  /** Array type. */
  ARRAY = 'array',
  /** Object type. */
  OBJECT = 'object',
}

/**
 * Basic {@link Schema} properties shared across several Schema-related
 * types.
 * @public
 */
export interface SchemaShared<T> {
  /** Optional. The format of the property.
   * When using the Gemini Developer API ({@link GoogleAIBackend}), this must be either `'enum'` or
   * `'date-time'`, otherwise requests will fail.
   */
  format?: string;
  /** Optional. The description of the property. */
  description?: string;
  /**
   * The title of the property. This helps document the schema's purpose but does not typically
   * constrain the generated value. It can subtly guide the model by clarifying the intent of a
   * field.
   */
  title?: string;
  /** Optional. The items of the property. */
  items?: T;
  /** The minimum number of items (elements) in a schema of type {@link SchemaType.ARRAY}. */
  minItems?: number;
  /** The maximum number of items (elements) in a schema of type {@link SchemaType.ARRAY}. */
  maxItems?: number;
  /** Optional. Map of `Schema` objects. */
  properties?: {
    [k: string]: T;
  };
  /** A hint suggesting the order in which the keys should appear in the generated JSON string. */
  propertyOrdering?: string[];
  /** Optional. The enum of the property. */
  enum?: string[];
  /** Optional. The example of the property. */
  example?: unknown;
  /** Optional. Whether the property is nullable. */
  nullable?: boolean;
  /** The minimum value of a numeric type. */
  minimum?: number;
  /** The maximum value of a numeric type. */
  maximum?: number;
  [key: string]: unknown;
}

/**
 * Params passed to {@link Schema} static methods to create specific
 * {@link Schema} classes.
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SchemaParams extends SchemaShared<SchemaInterface> {}

/**
 * Final format for {@link Schema} params passed to backend requests.
 * @public
 */
export interface SchemaRequest extends SchemaShared<SchemaRequest> {
  /**
   * The type of the property. {@link
   * SchemaType}.
   */
  type: SchemaType;
  /** Optional. Array of required property. */
  required?: string[];
}

/**
 * Interface for {@link Schema} class.
 * @public
 */
export interface SchemaInterface extends SchemaShared<SchemaInterface> {
  /**
   * The type of the property. {@link
   * SchemaType}.
   */
  type: SchemaType;
}

/**
 * Interface for {@link ObjectSchema} class.
 * @public
 */
export interface ObjectSchemaInterface extends SchemaInterface {
  type: SchemaType.OBJECT;
  optionalProperties?: string[];
}
