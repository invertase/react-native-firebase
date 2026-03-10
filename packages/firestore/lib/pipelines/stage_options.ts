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

import type { Pipeline } from './pipeline';
import type { DocumentReference, Query } from '../types/firestore';
import type VectorValue from '../FirestoreVectorValue';

/**
 * @beta
 * Utility type: only one property of T may be set.
 */
export type OneOf<T> = {
  [K in keyof T]: Pick<T, K> & {
    [P in Exclude<keyof T, K>]?: undefined;
  };
}[keyof T];

/**
 * @beta
 * Expression type kind (for internal/backend use).
 */
export type ExpressionType =
  | 'Field'
  | 'Constant'
  | 'Function'
  | 'AggregateFunction'
  | 'ListOfExpressions'
  | 'AliasedExpression';

/**
 * @beta
 * Firestore value type for isType() checks.
 */
export type Type =
  | 'null'
  | 'array'
  | 'boolean'
  | 'bytes'
  | 'timestamp'
  | 'geo_point'
  | 'number'
  | 'int32'
  | 'int64'
  | 'float64'
  | 'decimal128'
  | 'map'
  | 'reference'
  | 'string'
  | 'vector'
  | 'max_key'
  | 'min_key'
  | 'object_id'
  | 'regex'
  | 'request_timestamp';

/**
 * @beta
 * Time granularity for timestampTruncate.
 */
export type TimeGranularity =
  | 'microsecond'
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'week(monday)'
  | 'week(tuesday)'
  | 'week(wednesday)'
  | 'week(thursday)'
  | 'week(friday)'
  | 'week(saturday)'
  | 'week(sunday)'
  | 'isoWeek'
  | 'month'
  | 'quarter'
  | 'year'
  | 'isoYear';

/**
 * @beta
 * Boolean expression for pipeline `where()` (e.g. field('x').gt(0), and(...), or(...)).
 */
export interface BooleanExpression {
  readonly _brand?: 'BooleanExpression';
}

/**
 * @beta
 * Selectable for pipeline field selection/expressions (e.g. field('a').as('b'), expressions).
 */
export interface Selectable {
  selectable: true;
}

/**
 * @beta
 * Field reference for pipeline stages.
 */
export interface Field {
  readonly _brand?: 'Field';
}

/**
 * @beta
 * Function expression (e.g. map(...), array(...)). Used as return type and in Expression union.
 */
export interface FunctionExpression {
  selectable: true;
  readonly _brand?: 'FunctionExpression';
}

/**
 * @beta
 * Expression type for pipeline parameters (field refs, literals, function results).
 */
export type Expression = Field | FunctionExpression | Selectable | string;

/**
 * @beta
 * Ordering for pipeline sort() (e.g. Ordering.of(field('rating')).descending()).
 */
export interface Ordering {
  descending(): Ordering;
  ascending(): Ordering;
  readonly _brand?: 'Ordering';
}

/**
 * @beta
 * Accumulator for pipeline aggregate() (e.g. avg(field('rating')).as('avgRating'), countAll().as('total')).
 */
export interface Accumulator {
  as(name: string): Accumulator;
  readonly _brand?: 'Accumulator';
}

/**
 * @beta
 * Aggregate function (e.g. countAll()). Alias for Accumulator.
 */
export type AggregateFunction = Accumulator;

/**
 * @beta
 * Distance measure for vector search.
 */
export type PipelineDistanceMeasure = 'COSINE' | 'EUCLIDEAN' | 'DOT_PRODUCT';

/**
 * @beta
 * Options for pipeline aggregate() stage.
 */
export interface PipelineAggregateOptions {
  accumulators?: Accumulator[];
  groups?: Selectable[];
}

/**
 * @beta
 * Options for pipeline distinct() stage.
 */
export interface PipelineDistinctOptions {
  groups?: (Field | string)[];
}

/**
 * @beta
 * Options for pipeline findNearest() stage (vector search).
 */
export interface PipelineFindNearestOptions {
  field: string | Field;
  vectorValue: number[] | { values: number[] };
  distanceMeasure: PipelineDistanceMeasure;
  limit?: number;
  distanceField?: string;
}

/**
 * @beta
 * Options for pipeline replaceWith() stage.
 */
export interface PipelineReplaceWithOptions {
  map?: Selectable | string;
}

/**
 * @beta
 * Options for pipeline sample() stage.
 */
export interface PipelineSampleOptions {
  documents?: number;
  percentage?: number;
}

/**
 * @beta
 * Options for pipeline union() stage.
 */
export interface PipelineUnionOptions<T = import('../types/firestore').DocumentData> {
  pipeline?: Pipeline<T>;
}

/**
 * @beta
 * Options for pipeline unnest() stage.
 */
export interface PipelineUnnestOptions {
  selectable?: Selectable;
  indexField?: string;
}

/**
 * @beta
 * Options for pipeline rawStage().
 */
export interface PipelineRawStageOptions {
  [key: string]: unknown;
}

/**
 * @beta
 * Options defining how a Stage is evaluated. Base type for stage option types.
 */
export interface StageOptions {
  /**
   * @beta
   * Escape hatch for options not known at build time (e.g. backend-specific snake_case options).
   */
  rawOptions?: {
    [name: string]: unknown;
  };
}

/**
 * @beta
 * An aggregate function with an output alias.
 */
export interface AliasedAggregate {
  readonly aggregate: AggregateFunction;
  readonly alias: string;
}

/**
 * @beta
 * An expression with an output alias (implements Selectable).
 */
export interface AliasedExpression extends Selectable {
  readonly expr: Expression;
  readonly alias: string;
  exprType?: ExpressionType;
}

/**
 * @beta
 * Options for AddFields stage. At least one field required.
 */
export type AddFieldsStageOptions = StageOptions & {
  /**
   * @beta
   * The fields to add to each document, specified as a Selectable. At least one field is required.
   */
  fields: Selectable[];
};

/**
 * @beta
 * Options for Aggregate stage.
 */
export type AggregateStageOptions = StageOptions & {
  /**
   * @beta
   * The AliasedAggregate values specifying aggregate operations to perform on the input documents.
   */
  accumulators: AliasedAggregate[];
  /**
   * @beta
   * The Selectable expressions or field names to consider when determining distinct value combinations (groups), which will be aggregated over.
   */
  groups?: Array<string | Selectable>;
};

/**
 * @beta
 * Options for CollectionGroup stage.
 */
export type CollectionGroupStageOptions = StageOptions & {
  /**
   * @beta
   * ID of the collection group to use as the Pipeline source.
   */
  collectionId: string;
  /**
   * @beta
   * Specifies the name of an index to be used for a query, overriding the query optimizer's default choice. This can be useful for performance tuning in specific scenarios where the default index selection does not yield optimal performance. This property is optional. When provided, it should be the exact name of the index to force.
   */
  forceIndex?: string;
};

/**
 * @beta
 * Options for Collection stage.
 */
export type CollectionStageOptions = StageOptions & {
  /**
   * @beta
   * Name or reference to the collection that will be used as the Pipeline source.
   */
  collection: string | Query;
  /**
   * @beta
   * Specifies the name of an index to be used for a query, overriding the query optimizer's default choice. This can be useful for performance tuning in specific scenarios where the default index selection does not yield optimal performance. This property is optional. When provided, it should be the exact name of the index to force.
   */
  forceIndex?: string;
};

/**
 * @beta
 * Options for Database stage.
 */
export type DatabaseStageOptions = StageOptions & {};

/**
 * @beta
 * Options for Distinct stage.
 */
export type DistinctStageOptions = StageOptions & {
  /**
   * @beta
   * The Selectable expressions or field names to consider when determining distinct value combinations (groups).
   */
  groups: Array<string | Selectable>;
};

/**
 * @beta
 * Options for Documents stage.
 */
export type DocumentsStageOptions = StageOptions & {
  /**
   * @beta
   * An array of paths and DocumentReferences specifying the individual documents that will be the source of this pipeline. The converters for these DocumentReferences will be ignored and not have an effect on this pipeline. There must be at least one document specified in the array.
   */
  docs: Array<string | DocumentReference>;
};

/**
 * @beta
 * Options for FindNearest stage (vector search).
 */
export type FindNearestStageOptions = StageOptions & {
  /**
   * @beta
   * Specifies the field to be used. This can be a string representing the field path (e.g., 'fieldName', 'nested.fieldName') or an object of type Field representing a more complex field expression.
   */
  field: Field | string;
  /**
   * @beta
   * Specifies the query vector value, to which the vector distance will be computed.
   */
  vectorValue: VectorValue | number[];
  /**
   * @beta
   * Specifies the method used to compute the distance between vectors. Possible values are: 'euclidean', 'cosine', 'dot_product'.
   */
  distanceMeasure: 'euclidean' | 'cosine' | 'dot_product';
  /**
   * @beta
   * The maximum number of documents to return from the FindNearest stage.
   */
  limit?: number;
  /**
   * @beta
   * If set, specifies the field on the output documents that will contain the computed vector distance for the document. If not set, the computed vector distance will not be returned.
   */
  distanceField?: string;
};

/**
 * @beta
 * Options for Limit stage.
 */
export type LimitStageOptions = StageOptions & {
  /**
   * @beta
   * The maximum number of documents to return.
   */
  limit: number;
};

/**
 * @beta
 * Options for Offset stage.
 */
export type OffsetStageOptions = StageOptions & {
  /**
   * @beta
   * The number of documents to skip.
   */
  offset: number;
};

/**
 * @beta
 * Options for pipeline execute().
 */
export interface PipelineExecuteOptions extends StageOptions {
  pipeline: Pipeline;
  indexMode?: 'recommended';
  rawOptions?: { [name: string]: unknown };
}

/**
 * @beta
 * Options for RemoveFields stage.
 */
export type RemoveFieldsStageOptions = StageOptions & {
  /**
   * @beta
   * The fields to remove from each document.
   */
  fields: Array<Field | string>;
};

/**
 * @beta
 * Options for ReplaceWith stage.
 */
export type ReplaceWithStageOptions = StageOptions & {
  /**
   * @beta
   * The name of a field that contains a map or an Expression that evaluates to a map.
   */
  map: Expression | string;
};

/**
 * @beta
 * Options for Sample stage (documents or percentage, one of).
 */
export type SampleStageOptions = StageOptions &
  OneOf<{
    /**
     * @beta
     * If set, specifies the sample rate as a percentage of the input documents. Cannot be set when documents: number is set.
     */
    percentage: number;
    /**
     * @beta
     * If set, specifies the sample rate as a total number of documents to sample from the input documents. Cannot be set when percentage: number is set.
     */
    documents: number;
  }>;

/**
 * @beta
 * Options for Select stage.
 */
export type SelectStageOptions = StageOptions & {
  /**
   * @beta
   * The fields to include in the output documents, specified as Selectable expression or as a string value indicating the field name.
   */
  selections: Array<Selectable | string>;
};

/**
 * @beta
 * Options for Sort stage.
 */
export type SortStageOptions = StageOptions & {
  /**
   * @beta
   * Orderings specify how the input documents are sorted. One or more ordering are required.
   */
  orderings: Ordering[];
};

/**
 * @beta
 * Options for Union stage.
 */
export type UnionStageOptions = StageOptions & {
  /**
   * @beta
   * Specifies the other Pipeline to union with.
   */
  other: Pipeline;
};

/**
 * @beta
 * Options for Unnest stage.
 */
export type UnnestStageOptions = StageOptions & {
  /**
   * @beta
   * A Selectable object that defines an array expression to be un-nested and the alias for the un-nested field.
   */
  selectable: Selectable;
  /**
   * @beta
   * If set, specifies the field on the output documents that will contain the offset (starting at zero) that the element is from the original array.
   */
  indexField?: string;
};

/**
 * @beta
 * Options for Where stage.
 */
export type WhereStageOptions = StageOptions & {
  /**
   * @beta
   * The BooleanExpression to apply as a filter for each input document to this stage.
   */
  condition: BooleanExpression;
};
