import type { Bytes, DocumentData, DocumentReference, FieldPath, FieldValue, Firestore, FirestoreDataConverter, GeoPoint, PartialWithFieldValue, Primitive, Query, QueryDocumentSnapshot, SetOptions, SnapshotMetadata, SnapshotOptions, Timestamp, VectorValue, WithFieldValue } from './index';
/**
 * Cloud Firestore
 *
 * @packageDocumentation
 */
import { DocumentData as DocumentData_2 } from '@firebase/firestore-types';
import { EmulatorMockTokenOptions } from '@firebase/util';
import { FirebaseApp } from '@firebase/app';
import { FirebaseError } from '@firebase/util';
import { SetOptions as SetOptions_2 } from '@firebase/firestore-types';
/**
 * @beta
 * Creates an expression that computes the absolute value of a numeric value.
 *
 * @param expr - The expression to compute the absolute value of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the absolute value of the numeric value.
 */
export declare function abs(expr: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the absolute value of a numeric value.
 *
 * @param fieldName - The field to compute the absolute value of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the absolute value of the numeric value.
 */
export declare function abs(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that adds two expressions together.
 *
 * @example
 * ```typescript
 * // Add the value of the 'quantity' field and the 'reserve' field.
 * add(field("quantity"), field("reserve"));
 * ```
 *
 * @param first - The first expression to add.
 * @param second - The second expression or literal to add.
 * @param others - Optional other expressions or literals to add.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the addition operation.
 */
export declare function add(first: Expression, second: Expression | unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that adds a field's value to an expression.
 *
 * @example
 * ```typescript
 * // Add the value of the 'quantity' field and the 'reserve' field.
 * add("quantity", field("reserve"));
 * ```
 *
 * @param fieldName - The name of the field containing the value to add.
 * @param second - The second expression or literal to add.
 * @param others - Optional other expressions or literals to add.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the addition operation.
 */
export declare function add(fieldName: string, second: Expression | unknown): FunctionExpression;
/**
 * @beta
 * Options defining how an AddFieldsStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(addFields:1)}.
 */
export declare type AddFieldsStageOptions = StageOptions & {
    /**
     * @beta
     *  The fields to add to each document, specified as a {@link @firebase/firestore/pipelines#Selectable}.
     *  At least one field is required.
     */
    fields: Selectable[];
};
/**
 * @beta
 *
 * A class that represents an aggregate function.
 */
export declare class AggregateFunction {
    private name;
    private params;
    exprType: ExpressionType;
    /* Excluded from this release type: _methodName */
    constructor(name: string, params: Expression[]);
    /* Excluded from this release type: _create */
    /**
     * @beta
     * Assigns an alias to this AggregateFunction. The alias specifies the name that
     * the aggregated value will have in the output document.
     *
     * @example
     * ```typescript
     * // Calculate the average price of all items and assign it the alias "averagePrice".
     * firestore.pipeline().collection("items")
     *   .aggregate(field("price").average().as("averagePrice"));
     * ```
     *
     * @param name - The alias to assign to this AggregateFunction.
     * @returns A new {@link @firebase/firestore/pipelines#AliasedAggregate} that wraps this
     *     AggregateFunction and associates it with the provided alias.
     */
    as(name: string): AliasedAggregate;
}
/**
 * @beta
 * Options defining how an AggregateStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(aggregate:1)}.
 */
export declare type AggregateStageOptions = StageOptions & {
    /**
     * @beta
     * The {@link @firebase/firestore/pipelines#AliasedAggregate} values specifying aggregate operations to
     * perform on the input documents.
     */
    accumulators: AliasedAggregate[];
    /**
     * @beta
     * The {@link @firebase/firestore/pipelines#Selectable} expressions or field names to consider when determining
     * distinct value combinations (groups), which will be aggregated over.
     */
    groups?: Array<string | Selectable>;
};
/**
 * @beta
 *
 * An AggregateFunction with alias.
 */
export declare class AliasedAggregate {
    readonly aggregate: AggregateFunction;
    readonly alias: string;
    constructor(aggregate: AggregateFunction, alias: string, _methodName: string | undefined);
}
/**
 * @beta
 */
export declare class AliasedExpression implements Selectable {
    readonly expr: Expression;
    readonly alias: string;
    exprType: ExpressionType;
    selectable: true;
    constructor(expr: Expression, alias: string, _methodName: string | undefined);
}
/**
 * @beta
 *
 * Creates an expression that performs a logical 'AND' operation on multiple filter conditions.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is greater than 18 AND the 'city' field is "London" AND
 * // the 'status' field is "active"
 * const condition = and(greaterThan("age", 18), equal("city", "London"), equal("status", "active"));
 * ```
 *
 * @param first - The first filter condition.
 * @param second - The second filter condition.
 * @param more - Additional filter conditions to 'AND' together.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical 'AND' operation.
 */
export declare function and(first: BooleanExpression, second: BooleanExpression, ...more: BooleanExpression[]): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that creates a Firestore array value from an input array.
 *
 * @example
 * ```typescript
 * // Create an array value from the input array and reference the 'baz' field value from the input document.
 * array(['bar', Field.of('baz')]).as('foo');
 * ```
 *
 * @param elements - The input array to evaluate in the expression.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the array function.
 */
export declare function array(elements: unknown[]): FunctionExpression;
/**
 * @beta
 * Creates an aggregation that collects all values of an expression across multiple stage
 * inputs into an array.
 *
 * @remarks
 * If the expression resolves to an absent value, it is converted to `null`.
 * The order of elements in the output array is not stable and shouldn't be relied upon.
 *
 * @example
 * ```typescript
 * // Collect all tags from books into an array
 * arrayAgg(field("tags")).as("allTags");
 * ```
 *
 * @param expression - The expression to collect values from.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'array_agg' aggregation.
 */
export declare function arrayAgg(expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that collects all values of a field across multiple stage inputs
 * into an array.
 *
 * @remarks
 * If the expression resolves to an absent value, it is converted to `null`.
 * The order of elements in the output array is not stable and shouldn't be relied upon.
 *
 * @example
 * ```typescript
 * // Collect all tags from books into an array
 * arrayAgg("tags").as("allTags");
 * ```
 *
 * @param fieldName - The name of the field to collect values from.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'array_agg' aggregation.
 */
export declare function arrayAgg(fieldName: string): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that collects all distinct values of an expression across multiple stage
 * inputs into an array.
 *
 * @remarks
 * If the expression resolves to an absent value, it is converted to `null`.
 * The order of elements in the output array is not stable and shouldn't be relied upon.
 *
 * @example
 * ```typescript
 * // Collect all distinct tags from books into an array
 * arrayAggDistinct(field("tags")).as("allDistinctTags");
 * ```
 *
 * @param expression - The expression to collect values from.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'array_agg_distinct' aggregation.
 */
export declare function arrayAggDistinct(expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that collects all distinct values of a field across multiple stage inputs
 * into an array.
 *
 * @remarks
 * If the expression resolves to an absent value, it is converted to `null`.
 * The order of elements in the output array is not stable and shouldn't be relied upon.
 *
 * @example
 * ```typescript
 * // Collect all distinct tags from books into an array
 * arrayAggDistinct("tags").as("allDistinctTags");
 * ```
 *
 * @param fieldName - The name of the field to collect values from.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'array_agg_distinct' aggregation.
 */
export declare function arrayAggDistinct(fieldName: string): AggregateFunction;
/**
 * @beta
 *
 * Creates an expression that concatenates an array expression with other arrays.
 *
 * @example
 * ```typescript
 * // Combine the 'items' array with two new item arrays
 * arrayConcat(field("items"), [field("newItems"), field("otherItems")]);
 * ```
 *
 * @param firstArray - The first array expression to concatenate to.
 * @param secondArray - The second array expression or array literal to concatenate to.
 * @param otherArrays - Optional additional array expressions or array literals to concatenate.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the concatenated array.
 */
export declare function arrayConcat(firstArray: Expression, secondArray: Expression | unknown[], ...otherArrays: Array<Expression | unknown[]>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that concatenates a field's array value with other arrays.
 *
 * @example
 * ```typescript
 * // Combine the 'items' array with two new item arrays
 * arrayConcat("items", [field("newItems"), field("otherItems")]);
 * ```
 *
 * @param firstArrayField - The first array to concatenate to.
 * @param secondArray - The second array expression or array literal to concatenate to.
 * @param otherArrays - Optional additional array expressions or array literals to concatenate.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the concatenated array.
 */
export declare function arrayConcat(firstArrayField: string, secondArray: Expression | unknown[], ...otherArrays: Array<Expression | unknown[]>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains a specific element.
 *
 * @example
 * ```typescript
 * // Check if the 'colors' array contains the value of field 'selectedColor'
 * arrayContains(field("colors"), field("selectedColor"));
 * ```
 *
 * @param array - The array expression to check.
 * @param element - The element to search for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains' comparison.
 */
export declare function arrayContains(array: Expression, element: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains a specific element.
 *
 * @example
 * ```typescript
 * // Check if the 'colors' array contains "red"
 * arrayContains(field("colors"), "red");
 * ```
 *
 * @param array - The array expression to check.
 * @param element - The element to search for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains' comparison.
 */
export declare function arrayContains(array: Expression, element: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains a specific element.
 *
 * @example
 * ```typescript
 * // Check if the 'colors' array contains the value of field 'selectedColor'
 * arrayContains("colors", field("selectedColor"));
 * ```
 *
 * @param fieldName - The field name to check.
 * @param element - The element to search for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains' comparison.
 */
export declare function arrayContains(fieldName: string, element: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains a specific value.
 *
 * @example
 * ```typescript
 * // Check if the 'colors' array contains "red"
 * arrayContains("colors", "red");
 * ```
 *
 * @param fieldName - The field name to check.
 * @param element - The element to search for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains' comparison.
 */
export declare function arrayContains(fieldName: string, element: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains all the specified elements.
 *
 * @example
 * ```typescript
 * // Check if the "tags" array contains all of the values: "SciFi", "Adventure", and the value from field "tag1"
 * arrayContainsAll(field("tags"), [field("tag1"), constant("SciFi"), "Adventure"]);
 * ```
 *
 * @param array - The array expression to check.
 * @param values - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_all' comparison.
 */
export declare function arrayContainsAll(array: Expression, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains all the specified values or
 * expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'tags' array contains both of the values from field 'tag1', the value "SciFi", and "Adventure"
 * arrayContainsAll("tags", [field("tag1"), "SciFi", "Adventure"]);
 * ```
 *
 * @param fieldName - The field name to check.
 * @param values - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_all' comparison.
 */
export declare function arrayContainsAll(fieldName: string, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains all the specified elements.
 *
 * @example
 * ```typescript
 * // Check if the "tags" array contains all of the values: "SciFi", "Adventure", and the value from field "tag1"
 * arrayContainsAll(field("tags"), [field("tag1"), constant("SciFi"), "Adventure"]);
 * ```
 *
 * @param array - The array expression to check.
 * @param arrayExpression - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_all' comparison.
 */
export declare function arrayContainsAll(array: Expression, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains all the specified values or
 * expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'tags' array contains both of the values from field 'tag1', the value "SciFi", and "Adventure"
 * arrayContainsAll("tags", [field("tag1"), "SciFi", "Adventure"]);
 * ```
 *
 * @param fieldName - The field name to check.
 * @param arrayExpression - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_all' comparison.
 */
export declare function arrayContainsAll(fieldName: string, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains any of the specified
 * elements.
 *
 * @example
 * ```typescript
 * // Check if the 'categories' array contains either values from field "cate1" or "Science"
 * arrayContainsAny(field("categories"), [field("cate1"), "Science"]);
 * ```
 *
 * @param array - The array expression to check.
 * @param values - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_any' comparison.
 */
export declare function arrayContainsAny(array: Expression, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains any of the specified
 * elements.
 *
 * @example
 * ```typescript
 * // Check if the 'groups' array contains either the value from the 'userGroup' field
 * // or the value "guest"
 * arrayContainsAny("categories", [field("cate1"), "Science"]);
 * ```
 *
 * @param fieldName - The field name to check.
 * @param values - The elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_any' comparison.
 */
export declare function arrayContainsAny(fieldName: string, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an array expression contains any of the specified
 * elements.
 *
 * @example
 * ```typescript
 * // Check if the 'categories' array contains either values from field "cate1" or "Science"
 * arrayContainsAny(field("categories"), array([field("cate1"), "Science"]));
 * ```
 *
 * @param array - The array expression to check.
 * @param values - An expression that evaluates to an array, whose elements to check for in the array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_any' comparison.
 */
export declare function arrayContainsAny(array: Expression, values: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's array value contains any of the specified
 * elements.
 *
 * @example
 * ```typescript
 * // Check if the 'groups' array contains either the value from the 'userGroup' field
 * // or the value "guest"
 * arrayContainsAny("categories", array([field("cate1"), "Science"]));
 * ```
 *
 * @param fieldName - The field name to check.
 * @param values - An expression that evaluates to an array, whose elements to check for in the array field.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'array_contains_any' comparison.
 */
export declare function arrayContainsAny(fieldName: string, values: Expression): BooleanExpression;
/**
 * @beta
 * Creates an expression that indexes into an array from the beginning or end
 * and return the element. If the offset exceeds the array length, an error is
 * returned. A negative offset, starts from the end.
 *
 * @example
 * ```typescript
 * // Return the value in the tags field array at index 1.
 * arrayGet('tags', 1);
 * ```
 *
 * @param arrayField - The name of the array field.
 * @param offset - The index of the element to return.
 * @returns A new `Expression` representing the 'arrayGet' operation.
 */
export declare function arrayGet(arrayField: string, offset: number): FunctionExpression;
/**
 * @beta
 * Creates an expression that indexes into an array from the beginning or end
 * and return the element. If the offset exceeds the array length, an error is
 * returned. A negative offset, starts from the end.
 *
 * @example
 * ```typescript
 * // Return the value in the tags field array at index specified by field
 * // 'favoriteTag'.
 * arrayGet('tags', field('favoriteTag'));
 * ```
 *
 * @param arrayField - The name of the array field.
 * @param offsetExpr - An `Expression` evaluating to the index of the element to return.
 * @returns A new `Expression` representing the 'arrayGet' operation.
 */
export declare function arrayGet(arrayField: string, offsetExpr: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that indexes into an array from the beginning or end
 * and return the element. If the offset exceeds the array length, an error is
 * returned. A negative offset, starts from the end.
 *
 * @example
 * ```typescript
 * // Return the value in the tags field array at index 1.
 * arrayGet(field('tags'), 1);
 * ```
 *
 * @param arrayExpression - An `Expression` evaluating to an array.
 * @param offset - The index of the element to return.
 * @returns A new `Expression` representing the 'arrayGet' operation.
 */
export declare function arrayGet(arrayExpression: Expression, offset: number): FunctionExpression;
/**
 * @beta
 * Creates an expression that indexes into an array from the beginning or end
 * and return the element. If the offset exceeds the array length, an error is
 * returned. A negative offset, starts from the end.
 *
 * @example
 * ```typescript
 * // Return the value in the tags field array at index specified by field
 * // 'favoriteTag'.
 * arrayGet(field('tags'), field('favoriteTag'));
 * ```
 *
 * @param arrayExpression - An `Expression` evaluating to an array.
 * @param offsetExpr - An `Expression` evaluating to the index of the element to return.
 * @returns A new `Expression` representing the 'arrayGet' operation.
 */
export declare function arrayGet(arrayExpression: Expression, offsetExpr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the length of an array in a specified field.
 *
 * @example
 * ```typescript
 * // Get the number of items in field 'cart'
 * arrayLength('cart');
 * ```
 *
 * @param fieldName - The name of the field containing an array to calculate the length of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the array.
 */
export declare function arrayLength(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the length of an array expression.
 *
 * @example
 * ```typescript
 * // Get the number of items in the 'cart' array
 * arrayLength(field("cart"));
 * ```
 *
 * @param array - The array expression to calculate the length of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the array.
 */
export declare function arrayLength(array: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the sum of the elements in an array.
 *
 * @example
 * ```typescript
 * // Compute the sum of the elements in the 'scores' field.
 * arraySum("scores");
 * ```
 *
 * @param fieldName - The name of the field to compute the sum of.
 * @returns A new `Expression` representing the sum of the elements in the array.
 */
export declare function arraySum(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the sum of the elements in an array.
 *
 * @example
 * ```typescript
 * // Compute the sum of the elements in the 'scores' field.
 * arraySum(field("scores"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric array, which the sum will be computed for.
 * @returns A new `Expression` representing the sum of the elements in the array.
 */
export declare function arraySum(expression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in ascending order based on an expression.
 *
 * @example
 * ```typescript
 * // Sort documents by the 'name' field in lowercase in ascending order
 * firestore.pipeline().collection("users")
 *   .sort(ascending(field("name").toLower()));
 * ```
 *
 * @param expr - The expression to create an ascending ordering for.
 * @returns A new `Ordering` for ascending sorting.
 */
export declare function ascending(expr: Expression): Ordering;
/**
 * @beta
 *
 * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in ascending order based on a field.
 *
 * @example
 * ```typescript
 * // Sort documents by the 'name' field in ascending order
 * firestore.pipeline().collection("users")
 *   .sort(ascending("name"));
 * ```
 *
 * @param fieldName - The field to create an ascending ordering for.
 * @returns A new `Ordering` for ascending sorting.
 */
export declare function ascending(fieldName: string): Ordering;
/* Excluded from this release type: AuthTokenFactory */
/**
 * @beta
 *
 * Creates an aggregation that calculates the average (mean) of values from an expression across
 * multiple stage inputs.
 *
 * @example
 * ```typescript
 * // Calculate the average age of users
 * average(field("age")).as("averageAge");
 * ```
 *
 * @param expression - The expression representing the values to average.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'average' aggregation.
 */
export declare function average(expression: Expression): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that calculates the average (mean) of a field's values across multiple
 * stage inputs.
 *
 * @example
 * ```typescript
 * // Calculate the average age of users
 * average("age").as("averageAge");
 * ```
 *
 * @param fieldName - The name of the field containing numeric values to average.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'average' aggregation.
 */
export declare function average(fieldName: string): AggregateFunction;
/**
 * @beta
 *
 * An interface that represents a filter condition.
 */
export declare abstract class BooleanExpression extends Expression {
    /**
     * @beta
     * Creates an aggregation that finds the count of input documents satisfying
     * this boolean expression.
     *
     * @example
     * ```typescript
     * // Find the count of documents with a score greater than 90
     * field("score").greaterThan(90).countIf().as("highestScore");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'countIf' aggregation.
     */
    countIf(): AggregateFunction;
    /**
     * @beta
     * Creates an expression that negates this boolean expression.
     *
     * @example
     * ```typescript
     * // Find documents where the 'tags' field does not contain 'completed'
     * field("tags").arrayContains("completed").not();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the negated filter condition.
     */
    not(): BooleanExpression;
    /**
     * @beta
     * Creates a conditional expression that evaluates to the 'then' expression
     * if `this` expression evaluates to `true`,
     * or evaluates to the 'else' expression if `this` expressions evaluates `false`.
     *
     * @example
     * ```typescript
     * // If 'age' is greater than 18, return "Adult"; otherwise, return "Minor".
     * field("age").greaterThanOrEqual(18).conditional(constant("Adult"), constant("Minor"));
     * ```
     *
     * @param thenExpr - The expression to evaluate if the condition is true.
     * @param elseExpr - The expression to evaluate if the condition is false.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the conditional expression.
     */
    conditional(thenExpr: Expression, elseExpr: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the `catch` argument if there is an
     * error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Create an expression that protects against a divide by zero error
     * // but always returns a boolean expression.
     * constant(50).divide('length').gt(1).ifError(constant(false));
     * ```
     *
     * @param catchValue - The value that will be returned if this expression
     * produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchValue: BooleanExpression): BooleanExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the `catch` argument if there is an
     * error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Create an expression that protects against a divide by zero error
     * // but always returns a boolean expression.
     * constant(50).divide('length').gt(1).ifError(false);
     * ```
     *
     * @param catchValue - The value that will be returned if this expression
     * produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchValue: boolean): BooleanExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the `catch` argument if there is an
     * error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Create an expression that protects against a divide by zero error.
     * constant(50).divide('length').gt(1).ifError(constant(0));
     * ```
     *
     * @param catchValue - The value that will be returned if this expression
     * produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchValue: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the `catch` argument if there is an
     * error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Create an expression that protects against a divide by zero error.
     * constant(50).divide('length').gt(1).ifError(0);
     * ```
     *
     * @param catchValue - The value that will be returned if this expression
     * produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchValue: unknown): FunctionExpression;
}
/**
 * @beta
 *
 * Creates an expression that calculates the byte length of a string in UTF-8, or just the length of a Blob.
 *
 * @example
 * ```typescript
 * // Calculate the length of the 'myString' field in bytes.
 * byteLength(field("myString"));
 * ```
 *
 * @param expr - The expression representing the string.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string in bytes.
 */
export declare function byteLength(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the length of a string represented by a field in UTF-8 bytes, or just the length of a Blob.
 *
 * @example
 * ```typescript
 * // Calculate the length of the 'myString' field in bytes.
 * byteLength("myString");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string in bytes.
 */
export declare function byteLength(fieldName: string): FunctionExpression;
/* Excluded from this release type: ByteString */
/**
 * @beta
 * Creates an expression that computes the ceiling of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the ceiling of the 'price' field.
 * ceil("price");
 * ```
 *
 * @param fieldName - The name of the field to compute the ceiling of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the ceiling of the numeric value.
 */
export declare function ceil(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the ceiling of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the ceiling of the 'price' field.
 * ceil(field("price"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the ceiling will be computed for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the ceiling of the numeric value.
 */
export declare function ceil(expression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the character length of a string field in UTF8.
 *
 * @example
 * ```typescript
 * // Get the character length of the 'name' field in UTF-8.
 * strLength("name");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string.
 */
export declare function charLength(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the character length of a string expression in UTF-8.
 *
 * @example
 * ```typescript
 * // Get the character length of the 'name' field in UTF-8.
 * strLength(field("name"));
 * ```
 *
 * @param stringExpression - The expression representing the string to calculate the length of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string.
 */
export declare function charLength(stringExpression: Expression): FunctionExpression;
/**
 * @beta
 * Defines the configuration options for a CollectionGroupStage within a pipeline.
 * This type extends {@link @firebase/firestore/pipelines#StageOptions} and provides specific settings for how a collection group
 * is identified and processed during pipeline execution.
 *
 * See {@link @firebase/firestore/pipelines#PipelineSource.(collectionGroup:1)} to create a collection group stage.
 */
export declare type CollectionGroupStageOptions = StageOptions & {
    /**
     * @beta
     * ID of the collection group to use as the Pipeline source.
     */
    collectionId: string;
    /**
     * @beta
     * Specifies the name of an index to be used for a query, overriding the query optimizer's default choice.
     * This can be useful for performance tuning in specific scenarios where the default index selection
     * does not yield optimal performance.
     *
     * @remarks This property is optional. When provided, it should be the exact name of the index to force.
     */
    forceIndex?: string;
};
/**
 * @beta
 * Creates an expression that returns the collection ID from a path.
 *
 * @example
 * ```typescript
 * // Get the collection ID from a path.
 * collectionId("__name__");
 * ```
 *
 * @param fieldName - The name of the field to get the collection ID from.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the collectionId operation.
 */
export declare function collectionId(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the collection ID from a path.
 *
 * @example
 * ```typescript
 * // Get the collection ID from a path.
 * collectionId(field("__name__"));
 * ```
 *
 * @param expression - An expression evaluating to a path, which the collection ID will be extracted from.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the collectionId operation.
 */
export declare function collectionId(expression: Expression): FunctionExpression;
/**
 * @beta
 * Options defining how a CollectionStage is evaluated. See {@link @firebase/firestore/pipelines#PipelineSource.(collection:1)}.
 */
export declare type CollectionStageOptions = StageOptions & {
    /**
     * @beta
     * Name or reference to the collection that will be used as the Pipeline source.
     */
    collection: string | Query;
    /**
     * @beta
     * Specifies the name of an index to be used for a query, overriding the query optimizer's default choice.
     * This can be useful for performance tuning in specific scenarios where the default index selection
     * does not yield optimal performance.
     *
     * @remarks This property is optional. When provided, it should be the exact name of the index to force.
     */
    forceIndex?: string;
};
/**
 * @beta
 * Creates an expression that concatenates strings, arrays, or blobs. Types cannot be mixed.
 *
 * @example
 * ```typescript
 * // Concatenate the 'firstName' and 'lastName' fields with a space in between.
 * concat(field("firstName"), " ", field("lastName"))
 * ```
 *
 * @param first - The first expressions to concatenate.
 * @param second - The second literal or expression to concatenate.
 * @param others - Additional literals or expressions to concatenate.
 * @returns A new `Expression` representing the concatenation.
 */
export declare function concat(first: Expression, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 * Creates an expression that concatenates strings, arrays, or blobs. Types cannot be mixed.
 *
 * @example
 * ```typescript
 * // Concatenate a field with a literal string.
 * concat(field("firstName"), "Doe")
 * ```
 *
 * @param fieldName - The name of a field to concatenate.
 * @param second - The second literal or expression to concatenate.
 * @param others - Additional literal or expressions to concatenate.
 * @returns A new `Expression` representing the concatenation.
 */
export declare function concat(fieldName: string, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 *
 * Creates a conditional expression that evaluates to a 'then' expression if a condition is true
 * and an 'else' expression if the condition is false.
 *
 * @example
 * ```typescript
 * // If 'age' is greater than 18, return "Adult"; otherwise, return "Minor".
 * conditional(
 *     greaterThan("age", 18), constant("Adult"), constant("Minor"));
 * ```
 *
 * @param condition - The condition to evaluate.
 * @param thenExpr - The expression to evaluate if the condition is true.
 * @param elseExpr - The expression to evaluate if the condition is false.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the conditional expression.
 */
export declare function conditional(condition: BooleanExpression, thenExpr: Expression, elseExpr: Expression): FunctionExpression;
/**
 * @beta
 * Creates a `Constant` instance for a number value.
 *
 * @param value - The number value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: number): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a string value.
 *
 * @param value - The string value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: string): Expression;
/**
 * @beta
 * Creates a `BooleanExpression` instance for a boolean value.
 *
 * @param value - The boolean value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: boolean): BooleanExpression;
/**
 * @beta
 * Creates a `Constant` instance for a null value.
 *
 * @param value - The null value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: null): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a GeoPoint value.
 *
 * @param value - The GeoPoint value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: GeoPoint): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a Timestamp value.
 *
 * @param value - The Timestamp value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: Timestamp): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a Date value.
 *
 * @param value - The Date value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: Date): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a Bytes value.
 *
 * @param value - The Bytes value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: Bytes): Expression;
/**
 * @beta
 * Creates a `Constant` instance for a DocumentReference value.
 *
 * @param value - The DocumentReference value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: DocumentReference): Expression;
/* Excluded declaration from this release type: constant */
/**
 * @beta
 * Creates a `Constant` instance for a VectorValue value.
 *
 * @param value - The VectorValue value.
 * @returns A new `Constant` instance.
 */
export declare function constant(value: VectorValue): Expression;
/**
 * @beta
 *
 * Calculates the Cosine distance between a field's vector value and a literal vector value.
 *
 * @example
 * ```typescript
 * // Calculate the Cosine distance between the 'location' field and a target location
 * cosineDistance("location", [37.7749, -122.4194]);
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vector - The other vector (as an array of doubles) or {@link VectorValue} to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the Cosine distance between the two vectors.
 */
export declare function cosineDistance(fieldName: string, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Cosine distance between a field's vector value and a vector expression.
 *
 * @example
 * ```typescript
 * // Calculate the cosine distance between the 'userVector' field and the 'itemVector' field
 * cosineDistance("userVector", field("itemVector"));
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vectorExpression - The other vector (represented as an `Expression`) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the cosine distance between the two vectors.
 */
export declare function cosineDistance(fieldName: string, vectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Cosine distance between a vector expression and a vector literal.
 *
 * @example
 * ```typescript
 * // Calculate the cosine distance between the 'location' field and a target location
 * cosineDistance(field("location"), [37.7749, -122.4194]);
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to compare against.
 * @param vector - The other vector (as an array of doubles or VectorValue) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the cosine distance between the two vectors.
 */
export declare function cosineDistance(vectorExpression: Expression, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Cosine distance between two vector expressions.
 *
 * @example
 * ```typescript
 * // Calculate the cosine distance between the 'userVector' field and the 'itemVector' field
 * cosineDistance(field("userVector"), field("itemVector"));
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to compare against.
 * @param otherVectorExpression - The other vector (represented as an `Expression`) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the cosine distance between the two vectors.
 */
export declare function cosineDistance(vectorExpression: Expression, otherVectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an aggregation that counts the number of stage inputs with valid evaluations of the
 * provided expression.
 *
 * @example
 * ```typescript
 * // Count the number of items where the price is greater than 10
 * count(field("price").greaterThan(10)).as("expensiveItemCount");
 * ```
 *
 * @param expression - The expression to count.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'count' aggregation.
 */
export declare function count(expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that counts the number of stage inputs where the input field exists.
 *
 * @example
 * ```typescript
 * // Count the total number of products
 * count("productId").as("totalProducts");
 * ```
 *
 * @param fieldName - The name of the field to count.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'count' aggregation.
 */
export declare function count(fieldName: string): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that counts the total number of stage inputs.
 *
 * @example
 * ```typescript
 * // Count the total number of input documents
 * countAll().as("totalDocument");
 * ```
 *
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'countAll' aggregation.
 */
export declare function countAll(): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that counts the number of distinct values of a field.
 *
 * @param expr - The expression or field to count distinct values of.
 * @returns A new `AggregateFunction` representing the 'count_distinct' aggregation.
 */
export declare function countDistinct(expr: Expression | string): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that counts the number of stage inputs where the provided
 * boolean expression evaluates to true.
 *
 * @example
 * ```typescript
 * // Count the number of documents where 'is_active' field equals true
 * countIf(field("is_active").equal(true)).as("numActiveDocuments");
 * ```
 *
 * @param booleanExpr - The boolean expression to evaluate on each input.
 * @returns A new `AggregateFunction` representing the 'countIf' aggregation.
 */
export declare function countIf(booleanExpr: BooleanExpression): AggregateFunction;
/**
 * @beta
 *
 * Creates an expression that evaluates to the current server timestamp.
 *
 * @example
 * ```typescript
 * // Get the current server timestamp
 * currentTimestamp()
 * ```
 *
 * @returns A new Expression representing the current server timestamp.
 */
export declare function currentTimestamp(): FunctionExpression;
/**
 * @beta
 * Options defining how a DatabaseStage is evaluated. See {@link @firebase/firestore/pipelines#PipelineSource.(database:1)}.
 */
export declare type DatabaseStageOptions = StageOptions & {};
/**
 * @beta
 *
 * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in descending order based on an expression.
 *
 * @example
 * ```typescript
 * // Sort documents by the 'name' field in lowercase in descending order
 * firestore.pipeline().collection("users")
 *   .sort(descending(field("name").toLower()));
 * ```
 *
 * @param expr - The expression to create a descending ordering for.
 * @returns A new `Ordering` for descending sorting.
 */
export declare function descending(expr: Expression): Ordering;
/**
 * @beta
 *
 * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in descending order based on a field.
 *
 * @example
 * ```typescript
 * // Sort documents by the 'name' field in descending order
 * firestore.pipeline().collection("users")
 *   .sort(descending("name"));
 * ```
 *
 * @param fieldName - The field to create a descending ordering for.
 * @returns A new `Ordering` for descending sorting.
 */
export declare function descending(fieldName: string): Ordering;
/**
 * @beta
 * Options defining how a DistinctStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(distinct:1)}.
 */
export declare type DistinctStageOptions = StageOptions & {
    /**
     * @beta
     * The {@link @firebase/firestore/pipelines#Selectable} expressions or field names to consider when determining
     * distinct value combinations (groups).
     */
    groups: Array<string | Selectable>;
};
/**
 * @beta
 *
 * Creates an expression that divides two expressions.
 *
 * @example
 * ```typescript
 * // Divide the 'total' field by the 'count' field
 * divide(field("total"), field("count"));
 * ```
 *
 * @param left - The expression to be divided.
 * @param right - The expression to divide by.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the division operation.
 */
export declare function divide(left: Expression, right: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that divides an expression by a constant value.
 *
 * @example
 * ```typescript
 * // Divide the 'value' field by 10
 * divide(field("value"), 10);
 * ```
 *
 * @param expression - The expression to be divided.
 * @param value - The constant value to divide by.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the division operation.
 */
export declare function divide(expression: Expression, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that divides a field's value by an expression.
 *
 * @example
 * ```typescript
 * // Divide the 'total' field by the 'count' field
 * divide("total", field("count"));
 * ```
 *
 * @param fieldName - The field name to be divided.
 * @param expressions - The expression to divide by.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the division operation.
 */
export declare function divide(fieldName: string, expressions: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that divides a field's value by a constant value.
 *
 * @example
 * ```typescript
 * // Divide the 'value' field by 10
 * divide("value", 10);
 * ```
 *
 * @param fieldName - The field name to be divided.
 * @param value - The constant value to divide by.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the division operation.
 */
export declare function divide(fieldName: string, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the document ID from a path.
 *
 * @example
 * ```typescript
 * // Get the document ID from a path.
 * documentId(myDocumentReference);
 * ```
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the documentId operation.
 */
export declare function documentId(documentPath: string | DocumentReference): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the document ID from a path.
 *
 * @example
 * ```typescript
 * // Get the document ID from a path.
 * documentId(field("__path__"));
 * ```
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the documentId operation.
 */
export declare function documentId(documentPathExpr: Expression): FunctionExpression;
/**
 * @beta
 * Options defining how a DocumentsStage is evaluated. See {@link @firebase/firestore/pipelines#PipelineSource.(documents:1)}.
 */
export declare type DocumentsStageOptions = StageOptions & {
    /**
     * @beta
     * An array of paths and DocumentReferences specifying the individual documents that will be the source of this pipeline.
     * The converters for these DocumentReferences will be ignored and not have an effect on this pipeline.
     * There must be at least one document specified in the array.
     */
    docs: Array<string | DocumentReference>;
};
/**
 * @beta
 *
 * Calculates the dot product between a field's vector value and a double array.
 *
 * @example
 * ```typescript
 * // Calculate the dot product distance between a feature vector and a target vector
 * dotProduct("features", [0.5, 0.8, 0.2]);
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vector - The other vector (as an array of doubles or VectorValue) to calculate with.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the dot product between the two vectors.
 */
export declare function dotProduct(fieldName: string, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the dot product between a field's vector value and a vector expression.
 *
 * @example
 * ```typescript
 * // Calculate the dot product distance between two document vectors: 'docVector1' and 'docVector2'
 * dotProduct("docVector1", field("docVector2"));
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vectorExpression - The other vector (represented as an `Expression`) to calculate with.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the dot product between the two vectors.
 */
export declare function dotProduct(fieldName: string, vectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Calculates the dot product between a vector expression and a double array.
 *
 * @example
 * ```typescript
 * // Calculate the dot product between a feature vector and a target vector
 * dotProduct(field("features"), [0.5, 0.8, 0.2]);
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to calculate with.
 * @param vector - The other vector (as an array of doubles or VectorValue) to calculate with.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the dot product between the two vectors.
 */
export declare function dotProduct(vectorExpression: Expression, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the dot product between two vector expressions.
 *
 * @example
 * ```typescript
 * // Calculate the dot product between two document vectors: 'docVector1' and 'docVector2'
 * dotProduct(field("docVector1"), field("docVector2"));
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to calculate with.
 * @param otherVectorExpression - The other vector (represented as an `Expression`) to calculate with.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the dot product between the two vectors.
 */
export declare function dotProduct(vectorExpression: Expression, otherVectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value ends with a given postfix.
 *
 * @example
 * ```typescript
 * // Check if the 'filename' field ends with ".txt"
 * endsWith("filename", ".txt");
 * ```
 *
 * @param fieldName - The field name to check.
 * @param suffix - The postfix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ends with' comparison.
 */
export declare function endsWith(fieldName: string, suffix: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value ends with a given postfix.
 *
 * @example
 * ```typescript
 * // Check if the 'url' field ends with the value of the 'extension' field
 * endsWith("url", field("extension"));
 * ```
 *
 * @param fieldName - The field name to check.
 * @param suffix - The expression representing the postfix.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ends with' comparison.
 */
export declare function endsWith(fieldName: string, suffix: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression ends with a given postfix.
 *
 * @example
 * ```typescript
 * // Check if the result of concatenating 'firstName' and 'lastName' fields ends with "Jr."
 * endsWith(field("fullName"), "Jr.");
 * ```
 *
 * @param stringExpression - The expression to check.
 * @param suffix - The postfix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ends with' comparison.
 */
export declare function endsWith(stringExpression: Expression, suffix: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression ends with a given postfix.
 *
 * @example
 * ```typescript
 * // Check if the result of concatenating 'firstName' and 'lastName' fields ends with "Jr."
 * endsWith(field("fullName"), constant("Jr."));
 * ```
 *
 * @param stringExpression - The expression to check.
 * @param suffix - The postfix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ends with' comparison.
 */
export declare function endsWith(stringExpression: Expression, suffix: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if two expressions are equal.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is equal to an expression
 * equal(field("age"), field("minAge").add(10));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the equality comparison.
 */
export declare function equal(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is equal to 21
 * equal(field("age"), 21);
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the equality comparison.
 */
export declare function equal(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is equal to an expression.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is equal to the 'limit' field
 * equal("age", field("limit"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param expression - The expression to compare to.
 * @returns A new `Expression` representing the equality comparison.
 */
export declare function equal(fieldName: string, expression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'city' field is equal to string constant "London"
 * equal("city", "London");
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the equality comparison.
 */
export declare function equal(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression, when evaluated, is equal to any of the provided values or
 * expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'category' field is either "Electronics" or value of field 'primaryType'
 * equalAny(field("category"), [constant("Electronics"), field("primaryType")]);
 * ```
 *
 * @param expression - The expression whose results to compare.
 * @param values - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'IN' comparison.
 */
export declare function equalAny(expression: Expression, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is equal to any of the provided values.
 *
 * @example
 * ```typescript
 * // Check if the 'category' field is set to a value in the disabledCategories field
 * equalAny(field("category"), field('disabledCategories'));
 * ```
 *
 * @param expression - The expression whose results to compare.
 * @param arrayExpression - An expression that evaluates to an array, whose elements to check for equality to the input.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'IN' comparison.
 */
export declare function equalAny(expression: Expression, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is equal to any of the provided values or
 * expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'category' field is either "Electronics" or value of field 'primaryType'
 * equalAny("category", [constant("Electronics"), field("primaryType")]);
 * ```
 *
 * @param fieldName - The field to compare.
 * @param values - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'IN' comparison.
 */
export declare function equalAny(fieldName: string, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is equal to any of the provided values or
 * expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'category' field is either "Electronics" or value of field 'primaryType'
 * equalAny("category", ["Electronics", field("primaryType")]);
 * ```
 *
 * @param fieldName - The field to compare.
 * @param arrayExpression - An expression that evaluates to an array, whose elements to check for equality to the input field.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'IN' comparison.
 */
export declare function equalAny(fieldName: string, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Calculates the Euclidean distance between a field's vector value and a double array.
 *
 * @example
 * ```typescript
 * // Calculate the Euclidean distance between the 'location' field and a target location
 * euclideanDistance("location", [37.7749, -122.4194]);
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vector - The other vector (as an array of doubles or VectorValue) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the Euclidean distance between the two vectors.
 */
export declare function euclideanDistance(fieldName: string, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Euclidean distance between a field's vector value and a vector expression.
 *
 * @example
 * ```typescript
 * // Calculate the Euclidean distance between two vector fields: 'pointA' and 'pointB'
 * euclideanDistance("pointA", field("pointB"));
 * ```
 *
 * @param fieldName - The name of the field containing the first vector.
 * @param vectorExpression - The other vector (represented as an `Expression`) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the Euclidean distance between the two vectors.
 */
export declare function euclideanDistance(fieldName: string, vectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Euclidean distance between a vector expression and a double array.
 *
 * @example
 * ```typescript
 * // Calculate the Euclidean distance between the 'location' field and a target location
 *
 * euclideanDistance(field("location"), [37.7749, -122.4194]);
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to compare against.
 * @param vector - The other vector (as an array of doubles or VectorValue) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the Euclidean distance between the two vectors.
 */
export declare function euclideanDistance(vectorExpression: Expression, vector: number[] | VectorValue): FunctionExpression;
/**
 * @beta
 *
 * Calculates the Euclidean distance between two vector expressions.
 *
 * @example
 * ```typescript
 * // Calculate the Euclidean distance between two vector fields: 'pointA' and 'pointB'
 * euclideanDistance(field("pointA"), field("pointB"));
 * ```
 *
 * @param vectorExpression - The first vector (represented as an `Expression`) to compare against.
 * @param otherVectorExpression - The other vector (represented as an `Expression`) to compare against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the Euclidean distance between the two vectors.
 */
export declare function euclideanDistance(vectorExpression: Expression, otherVectorExpression: Expression): FunctionExpression;
/**
 * @beta
 * Executes a pipeline and returns a Promise to represent the asynchronous operation.
 *
 * The returned Promise can be used to track the progress of the pipeline execution
 * and retrieve the results (or handle any errors) asynchronously.
 *
 * The pipeline results are returned as a {@link @firebase/firestore/pipelines#PipelineSnapshot} that contains
 * a list of {@link @firebase/firestore/pipelines#PipelineResult} objects. Each {@link @firebase/firestore/pipelines#PipelineResult} typically
 * represents a single key/value map that has passed through all the
 * stages of the pipeline, however this might differ depending on the stages involved in the
 * pipeline. For example:
 *
 * <ul>
 *   <li>If there are no stages or only transformation stages, each {@link @firebase/firestore/pipelines#PipelineResult}
 *       represents a single document.</li>
 *   <li>If there is an aggregation, only a single {@link @firebase/firestore/pipelines#PipelineResult} is returned,
 *       representing the aggregated results over the entire dataset .</li>
 *   <li>If there is an aggregation stage with grouping, each {@link @firebase/firestore/pipelines#PipelineResult} represents a
 *       distinct group and its associated aggregated values.</li>
 * </ul>
 *
 * @example
 * ```typescript
 * const snapshot: PipelineSnapshot = await execute(firestore.pipeline().collection("books")
 *     .where(gt(field("rating"), 4.5))
 *     .select("title", "author", "rating"));
 *
 * const results: PipelineResults = snapshot.results;
 * ```
 *
 * @param pipeline - The pipeline to execute.
 * @returns A Promise representing the asynchronous pipeline execution.
 */
export declare function execute(pipeline: Pipeline): Promise<PipelineSnapshot>;
/**
 * @beta
 * Executes a pipeline and returns a Promise to represent the asynchronous operation.
 *
 * The returned Promise can be used to track the progress of the pipeline execution
 * and retrieve the results (or handle any errors) asynchronously.
 *
 * The pipeline results are returned as a {@link @firebase/firestore/pipelines#PipelineSnapshot} that contains
 * a list of {@link @firebase/firestore/pipelines#PipelineResult} objects. Each {@link @firebase/firestore/pipelines#PipelineResult} typically
 * represents a single key/value map that has passed through all the
 * stages of the pipeline, however this might differ depending on the stages involved in the
 * pipeline. For example:
 *
 * <ul>
 *   <li>If there are no stages or only transformation stages, each {@link @firebase/firestore/pipelines#PipelineResult}
 *       represents a single document.</li>
 *   <li>If there is an aggregation, only a single {@link @firebase/firestore/pipelines#PipelineResult} is returned,
 *       representing the aggregated results over the entire dataset .</li>
 *   <li>If there is an aggregation stage with grouping, each {@link @firebase/firestore/pipelines#PipelineResult} represents a
 *       distinct group and its associated aggregated values.</li>
 * </ul>
 *
 * @example
 * ```typescript
 * const snapshot: PipelineSnapshot = await execute(firestore.pipeline().collection("books")
 *     .where(gt(field("rating"), 4.5))
 *     .select("title", "author", "rating"));
 *
 * const results: PipelineResults = snapshot.results;
 * ```
 *
 * @param options - Specifies the pipeline to execute and other options for execute.
 * @returns A Promise representing the asynchronous pipeline execution.
 */
export declare function execute(options: PipelineExecuteOptions): Promise<PipelineSnapshot>;
/**
 * @beta
 *
 * Creates an expression that checks if a field exists.
 *
 * @example
 * ```typescript
 * // Check if the document has a field named "phoneNumber"
 * exists(field("phoneNumber"));
 * ```
 *
 * @param value - An expression evaluates to the name of the field to check.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'exists' check.
 */
export declare function exists(value: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field exists.
 *
 * @example
 * ```typescript
 * // Check if the document has a field named "phoneNumber"
 * exists("phoneNumber");
 * ```
 *
 * @param fieldName - The field name to check.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'exists' check.
 */
export declare function exists(fieldName: string): BooleanExpression;
/**
 * @beta
 * Creates an expression that computes e to the power of the expression's result.
 *
 * @example
 * ```typescript
 * // Compute e to the power of 2.
 * exp(constant(2));
 * ```
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the exp of the numeric value.
 */
export declare function exp(expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes e to the power of the expression's result.
 *
 * @example
 * ```typescript
 * // Compute e to the power of the 'value' field.
 * exp('value');
 * ```
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the exp of the numeric value.
 */
export declare function exp(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Represents an expression that can be evaluated to a value within the execution of a {@link
 * @firebase/firestore/pipelines#Pipeline}.
 *
 * Expressions are the building blocks for creating complex queries and transformations in
 * Firestore pipelines. They can represent:
 *
 * - **Field references:** Access values from document fields.
 * - **Literals:** Represent constant values (strings, numbers, booleans).
 * - **Function calls:** Apply functions to one or more expressions.
 *
 * The `Expression` class provides a fluent API for building expressions. You can chain together
 * method calls to create complex expressions.
 */
export declare abstract class Expression {
    abstract readonly expressionType: ExpressionType;
    /* Excluded from this release type: _readUserData */
    /**
     * Creates an expression that adds this expression to another expression.
     *
     * @example
     * ```typescript
     * // Add the value of the 'quantity' field and the 'reserve' field.
     * field("quantity").add(field("reserve"));
     * ```
     *
     * @param second - The expression or literal to add to this expression.
     * @param others - Optional additional expressions or literals to add to this expression.
     * @returns A new `Expression` representing the addition operation.
     */
    add(second: Expression | unknown): FunctionExpression;
    /**
     * @beta
     * Wraps the expression in a [BooleanExpression].
     *
     * @returns A [BooleanExpression] representing the same expression.
     */
    asBoolean(): BooleanExpression;
    /**
     * @beta
     * Creates an expression that subtracts another expression from this expression.
     *
     * @example
     * ```typescript
     * // Subtract the 'discount' field from the 'price' field
     * field("price").subtract(field("discount"));
     * ```
     *
     * @param subtrahend - The expression to subtract from this expression.
     * @returns A new `Expression` representing the subtraction operation.
     */
    subtract(subtrahend: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that subtracts a constant value from this expression.
     *
     * @example
     * ```typescript
     * // Subtract 20 from the value of the 'total' field
     * field("total").subtract(20);
     * ```
     *
     * @param subtrahend - The constant value to subtract.
     * @returns A new `Expression` representing the subtraction operation.
     */
    subtract(subtrahend: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that multiplies this expression by another expression.
     *
     * @example
     * ```typescript
     * // Multiply the 'quantity' field by the 'price' field
     * field("quantity").multiply(field("price"));
     * ```
     *
     * @param second - The second expression or literal to multiply by.
     * @param others - Optional additional expressions or literals to multiply by.
     * @returns A new `Expression` representing the multiplication operation.
     */
    multiply(second: Expression | number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that divides this expression by another expression.
     *
     * @example
     * ```typescript
     * // Divide the 'total' field by the 'count' field
     * field("total").divide(field("count"));
     * ```
     *
     * @param divisor - The expression to divide by.
     * @returns A new `Expression` representing the division operation.
     */
    divide(divisor: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that divides this expression by a constant value.
     *
     * @example
     * ```typescript
     * // Divide the 'value' field by 10
     * field("value").divide(10);
     * ```
     *
     * @param divisor - The constant value to divide by.
     * @returns A new `Expression` representing the division operation.
     */
    divide(divisor: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the modulo (remainder) of dividing this expression by another expression.
     *
     * @example
     * ```typescript
     * // Calculate the remainder of dividing the 'value' field by the 'divisor' field
     * field("value").mod(field("divisor"));
     * ```
     *
     * @param expression - The expression to divide by.
     * @returns A new `Expression` representing the modulo operation.
     */
    mod(expression: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the modulo (remainder) of dividing this expression by a constant value.
     *
     * @example
     * ```typescript
     * // Calculate the remainder of dividing the 'value' field by 10
     * field("value").mod(10);
     * ```
     *
     * @param value - The constant value to divide by.
     * @returns A new `Expression` representing the modulo operation.
     */
    mod(value: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is equal to another expression.
     *
     * @example
     * ```typescript
     * // Check if the 'age' field is equal to 21
     * field("age").equal(21);
     * ```
     *
     * @param expression - The expression to compare for equality.
     * @returns A new `Expression` representing the equality comparison.
     */
    equal(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is equal to a constant value.
     *
     * @example
     * ```typescript
     * // Check if the 'city' field is equal to "London"
     * field("city").equal("London");
     * ```
     *
     * @param value - The constant value to compare for equality.
     * @returns A new `Expression` representing the equality comparison.
     */
    equal(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is not equal to another expression.
     *
     * @example
     * ```typescript
     * // Check if the 'status' field is not equal to "completed"
     * field("status").notEqual("completed");
     * ```
     *
     * @param expression - The expression to compare for inequality.
     * @returns A new `Expression` representing the inequality comparison.
     */
    notEqual(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is not equal to a constant value.
     *
     * @example
     * ```typescript
     * // Check if the 'country' field is not equal to "USA"
     * field("country").notEqual("USA");
     * ```
     *
     * @param value - The constant value to compare for inequality.
     * @returns A new `Expression` representing the inequality comparison.
     */
    notEqual(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is less than another expression.
     *
     * @example
     * ```typescript
     * // Check if the 'age' field is less than 'limit'
     * field("age").lessThan(field('limit'));
     * ```
     *
     * @param experession - The expression to compare for less than.
     * @returns A new `Expression` representing the less than comparison.
     */
    lessThan(experession: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is less than a constant value.
     *
     * @example
     * ```typescript
     * // Check if the 'price' field is less than 50
     * field("price").lessThan(50);
     * ```
     *
     * @param value - The constant value to compare for less than.
     * @returns A new `Expression` representing the less than comparison.
     */
    lessThan(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is less than or equal to another
     * expression.
     *
     * @example
     * ```typescript
     * // Check if the 'quantity' field is less than or equal to 20
     * field("quantity").lessThan(constant(20));
     * ```
     *
     * @param expression - The expression to compare for less than or equal to.
     * @returns A new `Expression` representing the less than or equal to comparison.
     */
    lessThanOrEqual(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is less than or equal to a constant value.
     *
     * @example
     * ```typescript
     * // Check if the 'score' field is less than or equal to 70
     * field("score").lessThan(70);
     * ```
     *
     * @param value - The constant value to compare for less than or equal to.
     * @returns A new `Expression` representing the less than or equal to comparison.
     */
    lessThanOrEqual(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is greater than another expression.
     *
     * @example
     * ```typescript
     * // Check if the 'age' field is greater than the 'limit' field
     * field("age").greaterThan(field("limit"));
     * ```
     *
     * @param expression - The expression to compare for greater than.
     * @returns A new `Expression` representing the greater than comparison.
     */
    greaterThan(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is greater than a constant value.
     *
     * @example
     * ```typescript
     * // Check if the 'price' field is greater than 100
     * field("price").greaterThan(100);
     * ```
     *
     * @param value - The constant value to compare for greater than.
     * @returns A new `Expression` representing the greater than comparison.
     */
    greaterThan(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is greater than or equal to another
     * expression.
     *
     * @example
     * ```typescript
     * // Check if the 'quantity' field is greater than or equal to field 'requirement' plus 1
     * field("quantity").greaterThanOrEqual(field('requirement').add(1));
     * ```
     *
     * @param expression - The expression to compare for greater than or equal to.
     * @returns A new `Expression` representing the greater than or equal to comparison.
     */
    greaterThanOrEqual(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is greater than or equal to a constant
     * value.
     *
     * @example
     * ```typescript
     * // Check if the 'score' field is greater than or equal to 80
     * field("score").greaterThanOrEqual(80);
     * ```
     *
     * @param value - The constant value to compare for greater than or equal to.
     * @returns A new `Expression` representing the greater than or equal to comparison.
     */
    greaterThanOrEqual(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that concatenates an array expression with one or more other arrays.
     *
     * @example
     * ```typescript
     * // Combine the 'items' array with another array field.
     * field("items").arrayConcat(field("otherItems"));
     * ```
     * @param secondArray - Second array expression or array literal to concatenate.
     * @param otherArrays - Optional additional array expressions or array literals to concatenate.
     * @returns A new `Expression` representing the concatenated array.
     */
    arrayConcat(secondArray: Expression | unknown[], ...otherArrays: Array<Expression | unknown[]>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains a specific element.
     *
     * @example
     * ```typescript
     * // Check if the 'sizes' array contains the value from the 'selectedSize' field
     * field("sizes").arrayContains(field("selectedSize"));
     * ```
     *
     * @param expression - The element to search for in the array.
     * @returns A new `Expression` representing the 'array_contains' comparison.
     */
    arrayContains(expression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains a specific value.
     *
     * @example
     * ```typescript
     * // Check if the 'colors' array contains "red"
     * field("colors").arrayContains("red");
     * ```
     *
     * @param value - The element to search for in the array.
     * @returns A new `Expression` representing the 'array_contains' comparison.
     */
    arrayContains(value: unknown): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains all the specified elements.
     *
     * @example
     * ```typescript
     * // Check if the 'tags' array contains both the value in field "tag1" and the literal value "tag2"
     * field("tags").arrayContainsAll([field("tag1"), "tag2"]);
     * ```
     *
     * @param values - The elements to check for in the array.
     * @returns A new `Expression` representing the 'array_contains_all' comparison.
     */
    arrayContainsAll(values: Array<Expression | unknown>): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains all the specified elements.
     *
     * @example
     * ```typescript
     * // Check if the 'tags' array contains both of the values from field "tag1" and the literal value "tag2"
     * field("tags").arrayContainsAll(array([field("tag1"), "tag2"]));
     * ```
     *
     * @param arrayExpression - The elements to check for in the array.
     * @returns A new `Expression` representing the 'array_contains_all' comparison.
     */
    arrayContainsAll(arrayExpression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains any of the specified elements.
     *
     * @example
     * ```typescript
     * // Check if the 'categories' array contains either values from field "cate1" or "cate2"
     * field("categories").arrayContainsAny([field("cate1"), field("cate2")]);
     * ```
     *
     * @param values - The elements to check for in the array.
     * @returns A new `Expression` representing the 'array_contains_any' comparison.
     */
    arrayContainsAny(values: Array<Expression | unknown>): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if an array contains any of the specified elements.
     *
     * @example
     * ```typescript
     * // Check if the 'groups' array contains either the value from the 'userGroup' field
     * // or the value "guest"
     * field("groups").arrayContainsAny(array([field("userGroup"), "guest"]));
     * ```
     *
     * @param arrayExpression - The elements to check for in the array.
     * @returns A new `Expression` representing the 'array_contains_any' comparison.
     */
    arrayContainsAny(arrayExpression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that reverses an array.
     *
     * @example
     * ```typescript
     * // Reverse the value of the 'myArray' field.
     * field("myArray").arrayReverse();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed array.
     */
    arrayReverse(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the length of an array.
     *
     * @example
     * ```typescript
     * // Get the number of items in the 'cart' array
     * field("cart").arrayLength();
     * ```
     *
     * @returns A new `Expression` representing the length of the array.
     */
    arrayLength(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is equal to any of the provided values or
     * expressions.
     *
     * @example
     * ```typescript
     * // Check if the 'category' field is either "Electronics" or value of field 'primaryType'
     * field("category").equalAny("Electronics", field("primaryType"));
     * ```
     *
     * @param values - The values or expressions to check against.
     * @returns A new `Expression` representing the 'IN' comparison.
     */
    equalAny(values: Array<Expression | unknown>): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is equal to any of the provided values or
     * expressions.
     *
     * @example
     * ```typescript
     * // Check if the 'category' field is either "Electronics" or value of field 'primaryType'
     * field("category").equalAny(array(["Electronics", field("primaryType")]));
     * ```
     *
     * @param arrayExpression - An expression that evaluates to an array of values to check against.
     * @returns A new `Expression` representing the 'IN' comparison.
     */
    equalAny(arrayExpression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is not equal to any of the provided values or
     * expressions.
     *
     * @example
     * ```typescript
     * // Check if the 'status' field is neither "pending" nor the value of 'rejectedStatus'
     * field("status").notEqualAny(["pending", field("rejectedStatus")]);
     * ```
     *
     * @param values - The values or expressions to check against.
     * @returns A new `Expression` representing the 'notEqualAny' comparison.
     */
    notEqualAny(values: Array<Expression | unknown>): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if this expression is not equal to any of the values in the evaluated expression.
     *
     * @example
     * ```typescript
     * // Check if the 'status' field is not equal to any value in the field 'rejectedStatuses'
     * field("status").notEqualAny(field('rejectedStatuses'));
     * ```
     *
     * @param arrayExpression - The values or expressions to check against.
     * @returns A new `Expression` representing the 'notEqualAny' comparison.
     */
    notEqualAny(arrayExpression: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a field exists in the document.
     *
     * @example
     * ```typescript
     * // Check if the document has a field named "phoneNumber"
     * field("phoneNumber").exists();
     * ```
     *
     * @returns A new `Expression` representing the 'exists' check.
     */
    exists(): BooleanExpression;
    /**
     * @beta
     * Creates an expression that calculates the character length of a string in UTF-8.
     *
     * @example
     * ```typescript
     * // Get the character length of the 'name' field in its UTF-8 form.
     * field("name").charLength();
     * ```
     *
     * @returns A new `Expression` representing the length of the string.
     */
    charLength(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that performs a case-sensitive string comparison.
     *
     * @example
     * ```typescript
     * // Check if the 'title' field contains the word "guide" (case-sensitive)
     * field("title").like("%guide%");
     * ```
     *
     * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
     * @returns A new `Expression` representing the 'like' comparison.
     */
    like(pattern: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that performs a case-sensitive string comparison.
     *
     * @example
     * ```typescript
     * // Check if the 'title' field contains the word "guide" (case-sensitive)
     * field("title").like("%guide%");
     * ```
     *
     * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
     * @returns A new `Expression` representing the 'like' comparison.
     */
    like(pattern: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string contains a specified regular expression as a
     * substring.
     *
     * @example
     * ```typescript
     * // Check if the 'description' field contains "example" (case-insensitive)
     * field("description").regexContains("(?i)example");
     * ```
     *
     * @param pattern - The regular expression to use for the search.
     * @returns A new `Expression` representing the 'contains' comparison.
     */
    regexContains(pattern: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string contains a specified regular expression as a
     * substring.
     *
     * @example
     * ```typescript
     * // Check if the 'description' field contains the regular expression stored in field 'regex'
     * field("description").regexContains(field("regex"));
     * ```
     *
     * @param pattern - The regular expression to use for the search.
     * @returns A new `Expression` representing the 'contains' comparison.
     */
    regexContains(pattern: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that returns the first substring of a string expression that matches
     * a specified regular expression.
     *
     * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
     *
     * @example
     * ```typescript
     * // Extract the domain from an email address
     * field("email").regexFind("@.+")
     * ```
     *
     * @param pattern - The regular expression to search for.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
     */
    regexFind(pattern: string): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the first substring of a string expression that matches
     * a specified regular expression.
     *
     * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
     *
     * @example
     * ```typescript
     * // Extract the domain from an email address
     * field("email").regexFind(field("domain"))
     * ```
     *
     * @param pattern - The regular expression to search for.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
     */
    regexFind(pattern: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that evaluates to a list of all substrings in this string expression that
     * match a specified regular expression.
     *
     * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
     *
     * @example
     * ```typescript
     * // Extract all hashtags from a post content field
     * field("content").regexFindAll("#[A-Za-z0-9_]+")
     * ```
     *
     * @param pattern - The regular expression to search for.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} that evaluates to an array of matched substrings.
     */
    regexFindAll(pattern: string): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that evaluates to a list of all substrings in this string expression that
     * match a specified regular expression.
     *
     * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
     *
     * @example
     * ```typescript
     * // Extract all names from a post content field
     * field("content").regexFindAll(field("names"))
     * ```
     *
     * @param pattern - The regular expression to search for.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} that evaluates to an array of matched substrings.
     */
    regexFindAll(pattern: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that checks if a string matches a specified regular expression.
     *
     * @example
     * ```typescript
     * // Check if the 'email' field matches a valid email pattern
     * field("email").regexMatch("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
     * ```
     *
     * @param pattern - The regular expression to use for the match.
     * @returns A new `Expression` representing the regular expression match.
     */
    regexMatch(pattern: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string matches a specified regular expression.
     *
     * @example
     * ```typescript
     * // Check if the 'email' field matches a regular expression stored in field 'regex'
     * field("email").regexMatch(field("regex"));
     * ```
     *
     * @param pattern - The regular expression to use for the match.
     * @returns A new `Expression` representing the regular expression match.
     */
    regexMatch(pattern: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string contains a specified substring.
     *
     * @example
     * ```typescript
     * // Check if the 'description' field contains "example".
     * field("description").stringContains("example");
     * ```
     *
     * @param substring - The substring to search for.
     * @returns A new `Expression` representing the 'contains' comparison.
     */
    stringContains(substring: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string contains the string represented by another expression.
     *
     * @example
     * ```typescript
     * // Check if the 'description' field contains the value of the 'keyword' field.
     * field("description").stringContains(field("keyword"));
     * ```
     *
     * @param expr - The expression representing the substring to search for.
     * @returns A new `Expression` representing the 'contains' comparison.
     */
    stringContains(expr: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string starts with a given prefix.
     *
     * @example
     * ```typescript
     * // Check if the 'name' field starts with "Mr."
     * field("name").startsWith("Mr.");
     * ```
     *
     * @param prefix - The prefix to check for.
     * @returns A new `Expression` representing the 'starts with' comparison.
     */
    startsWith(prefix: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string starts with a given prefix (represented as an
     * expression).
     *
     * @example
     * ```typescript
     * // Check if the 'fullName' field starts with the value of the 'firstName' field
     * field("fullName").startsWith(field("firstName"));
     * ```
     *
     * @param prefix - The prefix expression to check for.
     * @returns A new `Expression` representing the 'starts with' comparison.
     */
    startsWith(prefix: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string ends with a given postfix.
     *
     * @example
     * ```typescript
     * // Check if the 'filename' field ends with ".txt"
     * field("filename").endsWith(".txt");
     * ```
     *
     * @param suffix - The postfix to check for.
     * @returns A new `Expression` representing the 'ends with' comparison.
     */
    endsWith(suffix: string): BooleanExpression;
    /**
     * @beta
     * Creates an expression that checks if a string ends with a given postfix (represented as an
     * expression).
     *
     * @example
     * ```typescript
     * // Check if the 'url' field ends with the value of the 'extension' field
     * field("url").endsWith(field("extension"));
     * ```
     *
     * @param suffix - The postfix expression to check for.
     * @returns A new `Expression` representing the 'ends with' comparison.
     */
    endsWith(suffix: Expression): BooleanExpression;
    /**
     * @beta
     * Creates an expression that converts a string to lowercase.
     *
     * @example
     * ```typescript
     * // Convert the 'name' field to lowercase
     * field("name").toLower();
     * ```
     *
     * @returns A new `Expression` representing the lowercase string.
     */
    toLower(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that converts a string to uppercase.
     *
     * @example
     * ```typescript
     * // Convert the 'title' field to uppercase
     * field("title").toUpper();
     * ```
     *
     * @returns A new `Expression` representing the uppercase string.
     */
    toUpper(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that removes leading and trailing characters from a string or byte array.
     *
     * @example
     * ```typescript
     * // Trim whitespace from the 'userInput' field
     * field("userInput").trim();
     *
     * // Trim quotes from the 'userInput' field
     * field("userInput").trim('"');
     * ```
     * @param valueToTrim - Optional This parameter is treated as a set of characters or bytes that will be
     * trimmed from the input. If not specified, then whitespace will be trimmed.
     * @returns A new `Expression` representing the trimmed string or byte array.
     */
    trim(valueToTrim?: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Trims whitespace or a specified set of characters/bytes from the beginning of a string or byte array.
     *
     * @example
     * ```typescript
     * // Trim whitespace from the beginning of the 'userInput' field
     * field("userInput").ltrim();
     *
     * // Trim quotes from the beginning of the 'userInput' field
     * field("userInput").ltrim('"');
     * ```
     *
     * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
     * If not specified, whitespace will be trimmed.
     * @returns A new `Expression` representing the trimmed string.
     */
    ltrim(valueToTrim?: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Trims whitespace or a specified set of characters/bytes from the end of a string or byte array.
     *
     * @example
     * ```typescript
     * // Trim whitespace from the end of the 'userInput' field
     * field("userInput").rtrim();
     *
     * // Trim quotes from the end of the 'userInput' field
     * field("userInput").rtrim('"');
     * ```
     *
     * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
     * If not specified, whitespace will be trimmed.
     * @returns A new `Expression` representing the trimmed string or byte array.
     */
    rtrim(valueToTrim?: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the data type of this expression's result, as a string.
     *
     * @remarks
     * This is evaluated on the backend. This means:
     * 1. Generic typed elements (like `array<string>`) evaluate strictly to the primitive `'array'`.
     * 2. Any custom `FirestoreDataConverter` mappings are ignored.
     * 3. For numeric values, the backend does not yield the JavaScript `"number"` type; it evaluates
     *    precisely as `"int64"` or `"float64"`.
     * 4. For date or timestamp objects, the backend evaluates to `"timestamp"`.
     *
     * @example
     * ```typescript
     * // Get the data type of the value in field 'title'
     * field('title').type()
     * ```
     *
     * @returns A new `Expression` representing the data type.
     */
    type(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that checks if the result of this expression is of the given type.
     *
     * @remarks Null or undefined fields evaluate to skip/error. Use `ifAbsent()` / `isAbsent()` to evaluate missing data.
     *
     * @example
     * ```typescript
     * // Check if the 'price' field is specifically an integer (not just 'number')
     * field('price').isType('int64');
     * ```
     *
     * @param type - The type to check for.
     * @returns A new `BooleanExpression` that evaluates to true if the expression's result is of the given type, false otherwise.
     */
    isType(type: Type): BooleanExpression;
    /**
     * @beta
     * Creates an expression that concatenates string expressions together.
     *
     * @example
     * ```typescript
     * // Combine the 'firstName', " ", and 'lastName' fields into a single string
     * field("firstName").stringConcat(constant(" "), field("lastName"));
     * ```
     *
     * @param secondString - The additional expression or string literal to concatenate.
     * @param otherStrings - Optional additional expressions or string literals to concatenate.
     * @returns A new `Expression` representing the concatenated string.
     */
    stringConcat(secondString: Expression | string, ...otherStrings: Array<Expression | string>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that finds the index of the first occurrence of a substring or byte sequence.
     *
     * @example
     * ```typescript
     * // Find the index of "foo" in the 'text' field
     * field("text").stringIndexOf("foo");
     * ```
     *
     * @param search - The substring or byte sequence to search for.
     * @returns A new `Expression` representing the index of the first occurrence.
     */
    stringIndexOf(search: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Creates an expression that repeats a string or byte array a specified number of times.
     *
     * @example
     * ```typescript
     * // Repeat the 'label' field 3 times
     * field("label").stringRepeat(3);
     * ```
     *
     * @param repetitions - The number of times to repeat the string or byte array.
     * @returns A new `Expression` representing the repeated string or byte array.
     */
    stringRepeat(repetitions: number | Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that replaces all occurrences of a substring or byte sequence with a replacement.
     *
     * @example
     * ```typescript
     * // Replace all occurrences of "foo" with "bar" in the 'text' field
     * field("text").stringReplaceAll("foo", "bar");
     * ```
     *
     * @param find - The substring or byte sequence to search for.
     * @param replacement - The replacement string or byte sequence.
     * @returns A new `Expression` representing the string or byte array with replacements.
     */
    stringReplaceAll(find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Creates an expression that replaces the first occurrence of a substring or byte sequence with a replacement.
     *
     * @example
     * ```typescript
     * // Replace the first occurrence of "foo" with "bar" in the 'text' field
     * field("text").stringReplaceOne("foo", "bar");
     * ```
     *
     * @param find - The substring or byte sequence to search for.
     * @param replacement - The replacement string or byte sequence.
     * @returns A new `Expression` representing the string or byte array with the replacement.
     */
    stringReplaceOne(find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
    /**
     * @beta
     * Creates an expression that concatenates expression results together.
     *
     * @example
     * ```typescript
     * // Combine the 'firstName', ' ', and 'lastName' fields into a single value.
     * field("firstName").concat(constant(" "), field("lastName"));
     * ```
     *
     * @param second - The additional expression or literal to concatenate.
     * @param others - Optional additional expressions or literals to concatenate.
     * @returns A new `Expression` representing the concatenated value.
     */
    concat(second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that reverses this string expression.
     *
     * @example
     * ```typescript
     * // Reverse the value of the 'myString' field.
     * field("myString").reverse();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
     */
    reverse(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the length of this string expression in bytes.
     *
     * @example
     * ```typescript
     * // Calculate the length of the 'myString' field in bytes.
     * field("myString").byteLength();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the string in bytes.
     */
    byteLength(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the ceiling of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the ceiling of the 'price' field.
     * field("price").ceil();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the ceiling of the numeric value.
     */
    ceil(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the floor of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the floor of the 'price' field.
     * field("price").floor();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the floor of the numeric value.
     */
    floor(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the absolute value of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the absolute value of the 'price' field.
     * field("price").abs();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the absolute value of the numeric value.
     */
    abs(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes e to the power of this expression.
     *
     * @example
     * ```typescript
     * // Compute e to the power of the 'value' field.
     * field("value").exp();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the exp of the numeric value.
     */
    exp(): FunctionExpression;
    /**
     * @beta
     * Accesses a value from a map (object) field using the provided key.
     *
     * @example
     * ```typescript
     * // Get the 'city' value from the 'address' map field
     * field("address").mapGet("city");
     * ```
     *
     * @param subfield - The key to access in the map.
     * @returns A new `Expression` representing the value associated with the given key in the map.
     */
    mapGet(subfield: string): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns a new map with the specified entries added or updated.
     *
     * @remarks
     * Note that `mapSet` only performs shallow updates to the map. Setting a value to `null`
     * will retain the key with a `null` value. To remove a key entirely, use `mapRemove`.
     *
     * @example
     * ```typescript
     * // Set the 'city' to "San Francisco" in the 'address' map
     * field("address").mapSet("city", "San Francisco");
     * ```
     *
     * @param key - The key to set. Must be a string or a constant string expression.
     * @param value - The value to set.
     * @param moreKeyValues - Additional key-value pairs to set.
     * @returns A new `Expression` representing the map with the entries set.
     */
    mapSet(key: string | Expression, value: unknown, ...moreKeyValues: unknown[]): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the keys of a map.
     *
     * @remarks
     * While the backend generally preserves insertion order, relying on the
     * order of the output array is not guaranteed and should be avoided.
     *
     * @example
     * ```typescript
     * // Get the keys of the 'address' map
     * field("address").mapKeys();
     * ```
     *
     * @returns A new `Expression` representing the keys of the map.
     */
    mapKeys(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the values of a map.
     *
     * @remarks
     * While the backend generally preserves insertion order, relying on the
     * order of the output array is not guaranteed and should be avoided.
     *
     * @example
     * ```typescript
     * // Get the values of the 'address' map
     * field("address").mapValues();
     * ```
     *
     * @returns A new `Expression` representing the values of the map.
     */
    mapValues(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the entries of a map as an array of maps,
     * where each map contains a `"k"` property for the key and a `"v"` property for the value.
     * For example: `[{ k: "key1", v: "value1" }, ...]`.
     *
     * @example
     * ```typescript
     * // Get the entries of the 'address' map
     * field("address").mapEntries();
     * ```
     *
     * @returns A new `Expression` representing the entries of the map.
     */
    mapEntries(): FunctionExpression;
    /**
     * @beta
     * Creates an aggregation that counts the number of stage inputs with valid evaluations of the
     * expression or field.
     *
     * @example
     * ```typescript
     * // Count the total number of products
     * field("productId").count().as("totalProducts");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'count' aggregation.
     */
    count(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that calculates the sum of a numeric field across multiple stage inputs.
     *
     * @example
     * ```typescript
     * // Calculate the total revenue from a set of orders
     * field("orderAmount").sum().as("totalRevenue");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'sum' aggregation.
     */
    sum(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that calculates the average (mean) of a numeric field across multiple
     * stage inputs.
     *
     * @example
     * ```typescript
     * // Calculate the average age of users
     * field("age").average().as("averageAge");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'average' aggregation.
     */
    average(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that finds the minimum value of a field across multiple stage inputs.
     *
     * @example
     * ```typescript
     * // Find the lowest price of all products
     * field("price").minimum().as("lowestPrice");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'minimum' aggregation.
     */
    minimum(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that finds the maximum value of a field across multiple stage inputs.
     *
     * @example
     * ```typescript
     * // Find the highest score in a leaderboard
     * field("score").maximum().as("highestScore");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'maximum' aggregation.
     */
    maximum(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that finds the first value of an expression across multiple stage inputs.
     *
     * @example
     * ```typescript
     * // Find the first value of the 'rating' field
     * field("rating").first().as("firstRating");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'first' aggregation.
     */
    first(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that finds the last value of an expression across multiple stage inputs.
     *
     * @example
     * ```typescript
     * // Find the last value of the 'rating' field
     * field("rating").last().as("lastRating");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'last' aggregation.
     */
    last(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that collects all values of an expression across multiple stage inputs
     * into an array.
     *
     * @remarks
     * If the expression resolves to an absent value, it is converted to `null`.
     * The order of elements in the output array is not stable and shouldn't be relied upon.
     *
     * @example
     * ```typescript
     * // Collect all tags from books into an array
     * field("tags").arrayAgg().as("allTags");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'array_agg' aggregation.
     */
    arrayAgg(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that collects all distinct values of an expression across multiple stage
     * inputs into an array.
     *
     * @remarks
     * If the expression resolves to an absent value, it is converted to `null`.
     * The order of elements in the output array is not stable and shouldn't be relied upon.
     *
     * @example
     * ```typescript
     * // Collect all distinct tags from books into an array
     * field("tags").arrayAggDistinct().as("allDistinctTags");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'array_agg_distinct' aggregation.
     */
    arrayAggDistinct(): AggregateFunction;
    /**
     * @beta
     * Creates an aggregation that counts the number of distinct values of the expression or field.
     *
     * @example
     * ```typescript
     * // Count the distinct number of products
     * field("productId").countDistinct().as("distinctProducts");
     * ```
     *
     * @returns A new `AggregateFunction` representing the 'count_distinct' aggregation.
     */
    countDistinct(): AggregateFunction;
    /**
     * @beta
     * Creates an expression that returns the larger value between this expression and another expression, based on Firestore's value type ordering.
     *
     * @example
     * ```typescript
     * // Returns the larger value between the 'timestamp' field and the current timestamp.
     * field("timestamp").logicalMaximum(Function.currentTimestamp());
     * ```
     *
     * @param second - The second expression or literal to compare with.
     * @param others - Optional additional expressions or literals to compare with.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical maximum operation.
     */
    logicalMaximum(second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the smaller value between this expression and another expression, based on Firestore's value type ordering.
     *
     * @example
     * ```typescript
     * // Returns the smaller value between the 'timestamp' field and the current timestamp.
     * field("timestamp").logicalMinimum(Function.currentTimestamp());
     * ```
     *
     * @param second - The second expression or literal to compare with.
     * @param others - Optional additional expressions or literals to compare with.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical minimum operation.
     */
    logicalMinimum(second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the length (number of dimensions) of this Firestore Vector expression.
     *
     * @example
     * ```typescript
     * // Get the vector length (dimension) of the field 'embedding'.
     * field("embedding").vectorLength();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the vector.
     */
    vectorLength(): FunctionExpression;
    /**
     * @beta
     * Calculates the cosine distance between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the cosine distance between the 'userVector' field and the 'itemVector' field
     * field("userVector").cosineDistance(field("itemVector"));
     * ```
     *
     * @param vectorExpression - The other vector (represented as an Expression) to compare against.
     * @returns A new `Expression` representing the cosine distance between the two vectors.
     */
    cosineDistance(vectorExpression: Expression): FunctionExpression;
    /**
     * @beta
     * Calculates the Cosine distance between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the Cosine distance between the 'location' field and a target location
     * field("location").cosineDistance(new VectorValue([37.7749, -122.4194]));
     * ```
     *
     * @param vector - The other vector (as a VectorValue) to compare against.
     * @returns A new `Expression` representing the Cosine* distance between the two vectors.
     */
    cosineDistance(vector: VectorValue | number[]): FunctionExpression;
    /**
     * @beta
     * Calculates the dot product between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the dot product between a feature vector and a target vector
     * field("features").dotProduct([0.5, 0.8, 0.2]);
     * ```
     *
     * @param vectorExpression - The other vector (as an array of numbers) to calculate with.
     * @returns A new `Expression` representing the dot product between the two vectors.
     */
    dotProduct(vectorExpression: Expression): FunctionExpression;
    /**
     * @beta
     * Calculates the dot product between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the dot product between a feature vector and a target vector
     * field("features").dotProduct(new VectorValue([0.5, 0.8, 0.2]));
     * ```
     *
     * @param vector - The other vector (as an array of numbers) to calculate with.
     * @returns A new `Expression` representing the dot product between the two vectors.
     */
    dotProduct(vector: VectorValue | number[]): FunctionExpression;
    /**
     * @beta
     * Calculates the Euclidean distance between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the Euclidean distance between the 'location' field and a target location
     * field("location").euclideanDistance([37.7749, -122.4194]);
     * ```
     *
     * @param vectorExpression - The other vector (as an array of numbers) to calculate with.
     * @returns A new `Expression` representing the Euclidean distance between the two vectors.
     */
    euclideanDistance(vectorExpression: Expression): FunctionExpression;
    /**
     * @beta
     * Calculates the Euclidean distance between two vectors.
     *
     * @example
     * ```typescript
     * // Calculate the Euclidean distance between the 'location' field and a target location
     * field("location").euclideanDistance(new VectorValue([37.7749, -122.4194]));
     * ```
     *
     * @param vector - The other vector (as a VectorValue) to compare against.
     * @returns A new `Expression` representing the Euclidean distance between the two vectors.
     */
    euclideanDistance(vector: VectorValue | number[]): FunctionExpression;
    /**
     * @beta
     * Creates an expression that interprets this expression as the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
     * and returns a timestamp.
     *
     * @example
     * ```typescript
     * // Interpret the 'microseconds' field as microseconds since epoch.
     * field("microseconds").unixMicrosToTimestamp();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
     */
    unixMicrosToTimestamp(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that converts this timestamp expression to the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
     *
     * @example
     * ```typescript
     * // Convert the 'timestamp' field to microseconds since epoch.
     * field("timestamp").timestampToUnixMicros();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of microseconds since epoch.
     */
    timestampToUnixMicros(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that interprets this expression as the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
     * and returns a timestamp.
     *
     * @example
     * ```typescript
     * // Interpret the 'milliseconds' field as milliseconds since epoch.
     * field("milliseconds").unixMillisToTimestamp();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
     */
    unixMillisToTimestamp(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that converts this timestamp expression to the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
     *
     * @example
     * ```typescript
     * // Convert the 'timestamp' field to milliseconds since epoch.
     * field("timestamp").timestampToUnixMillis();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of milliseconds since epoch.
     */
    timestampToUnixMillis(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that interprets this expression as the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC)
     * and returns a timestamp.
     *
     * @example
     * ```typescript
     * // Interpret the 'seconds' field as seconds since epoch.
     * field("seconds").unixSecondsToTimestamp();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
     */
    unixSecondsToTimestamp(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that converts this timestamp expression to the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC).
     *
     * @example
     * ```typescript
     * // Convert the 'timestamp' field to seconds since epoch.
     * field("timestamp").timestampToUnixSeconds();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of seconds since epoch.
     */
    timestampToUnixSeconds(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that adds a specified amount of time to this timestamp expression.
     *
     * @example
     * ```typescript
     * // Add some duration determined by field 'unit' and 'amount' to the 'timestamp' field.
     * field("timestamp").timestampAdd(field("unit"), field("amount"));
     * ```
     *
     * @param unit - The expression evaluates to unit of time, must be one of 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day'.
     * @param amount - The expression evaluates to amount of the unit.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
     */
    timestampAdd(unit: Expression, amount: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that adds a specified amount of time to this timestamp expression.
     *
     * @example
     * ```typescript
     * // Add 1 day to the 'timestamp' field.
     * field("timestamp").timestampAdd("day", 1);
     * ```
     *
     * @param unit - The unit of time to add (e.g., "day", "hour").
     * @param amount - The amount of time to add.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
     */
    timestampAdd(unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that subtracts a specified amount of time from this timestamp expression.
     *
     * @example
     * ```typescript
     * // Subtract some duration determined by field 'unit' and 'amount' from the 'timestamp' field.
     * field("timestamp").timestampSubtract(field("unit"), field("amount"));
     * ```
     *
     * @param unit - The expression evaluates to unit of time, must be one of 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day'.
     * @param amount - The expression evaluates to amount of the unit.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
     */
    timestampSubtract(unit: Expression, amount: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that subtracts a specified amount of time from this timestamp expression.
     *
     * @example
     * ```typescript
     * // Subtract 1 day from the 'timestamp' field.
     * field("timestamp").timestampSubtract("day", 1);
     * ```
     *
     * @param unit - The unit of time to subtract (e.g., "day", "hour").
     * @param amount - The amount of time to subtract.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
     */
    timestampSubtract(unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the document ID from a path.
     *
     * @example
     * ```typescript
     * // Get the document ID from a path.
     * field("__path__").documentId();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the documentId operation.
     */
    documentId(): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns a substring of the results of this expression.
     *
     * @param position - Index of the first character of the substring.
     * @param length - Length of the substring. If not provided, the substring will
     * end at the end of the input.
     */
    substring(position: number, length?: number): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns a substring of the results of this expression.
     *
     * @param position - An expression returning the index of the first character of the substring.
     * @param length - An expression returning the length of the substring. If not provided the
     * substring will end at the end of the input.
     */
    substring(position: Expression, length?: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that indexes into an array from the beginning or end
     * and returns the element. If the offset exceeds the array length, an error is
     * returned. A negative offset, starts from the end.
     *
     * @example
     * ```typescript
     * // Return the value in the 'tags' field array at index `1`.
     * field('tags').arrayGet(1);
     * ```
     *
     * @param offset - The index of the element to return.
     * @returns A new `Expression` representing the 'arrayGet' operation.
     */
    arrayGet(offset: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that indexes into an array from the beginning or end
     * and returns the element. If the offset exceeds the array length, an error is
     * returned. A negative offset, starts from the end.
     *
     * @example
     * ```typescript
     * // Return the value in the tags field array at index specified by field
     * // 'favoriteTag'.
     * field('tags').arrayGet(field('favoriteTag'));
     * ```
     *
     * @param offsetExpr - An `Expression` evaluating to the index of the element to return.
     * @returns A new `Expression` representing the 'arrayGet' operation.
     */
    arrayGet(offsetExpr: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that checks if a given expression produces an error.
     *
     * @example
     * ```typescript
     * // Check if the result of a calculation is an error
     * field("title").arrayContains(1).isError();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#BooleanExpression} representing the 'isError' check.
     */
    isError(): BooleanExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the result of the `catchExpr` argument
     * if there is an error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Returns the first item in the title field arrays, or returns
     * // the entire title field if the array is empty or the field is another type.
     * field("title").arrayGet(0).ifError(field("title"));
     * ```
     *
     * @param catchExpr - The catch expression that will be evaluated and
     * returned if this expression produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchExpr: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns the `catch` argument if there is an
     * error, else return the result of this expression.
     *
     * @example
     * ```typescript
     * // Returns the first item in the title field arrays, or returns
     * // "Default Title"
     * field("title").arrayGet(0).ifError("Default Title");
     * ```
     *
     * @param catchValue - The value that will be returned if this expression
     * produces an error.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
     */
    ifError(catchValue: unknown): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that returns `true` if the result of this expression
     * is absent. Otherwise, returns `false` even if the value is `null`.
     *
     * @example
     * ```typescript
     * // Check if the field `value` is absent.
     * field("value").isAbsent();
     * @example
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#BooleanExpression} representing the 'isAbsent' check.
     */
    isAbsent(): BooleanExpression;
    /**
     * @beta
     *
     * Creates an expression that removes a key from the map produced by evaluating this expression.
     *
     * @example
     * ```
     * // Removes the key 'baz' from the input map.
     * map({foo: 'bar', baz: true}).mapRemove('baz');
     * ```
     *
     * @param key - The name of the key to remove from the input map.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'mapRemove' operation.
     */
    mapRemove(key: string): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that removes a key from the map produced by evaluating this expression.
     *
     * @example
     * ```
     * // Removes the key 'baz' from the input map.
     * map({foo: 'bar', baz: true}).mapRemove(constant('baz'));
     * @example
     * ```
     *
     * @param keyExpr - An expression that produces the name of the key to remove from the input map.
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'mapRemove' operation.
     */
    mapRemove(keyExpr: Expression): FunctionExpression;
    /**
     * @beta
     *
     * Creates an expression that merges multiple map values.
     *
     * @example
     * ```
     * // Merges the map in the settings field with, a map literal, and a map in
     * // that is conditionally returned by another expression
     * field('settings').mapMerge({ enabled: true }, conditional(field('isAdmin'), { admin: true}, {})
     * ```
     *
     * @param secondMap - A required second map to merge. Represented as a literal or
     * an expression that returns a map.
     * @param otherMaps - Optional additional maps to merge. Each map is represented
     * as a literal or an expression that returns a map.
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'mapMerge' operation.
     */
    mapMerge(secondMap: Record<string, unknown> | Expression, ...otherMaps: Array<Record<string, unknown> | Expression>): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the value of this expression raised to the power of another expression.
     *
     * @example
     * ```typescript
     * // Raise the value of the 'base' field to the power of the 'exponent' field.
     * field("base").pow(field("exponent"));
     * ```
     *
     * @param exponent - The expression to raise this expression to the power of.
     * @returns A new `Expression` representing the power operation.
     */
    pow(exponent: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the value of this expression raised to the power of a constant value.
     *
     * @example
     * ```typescript
     * // Raise the value of the 'base' field to the power of 2.
     * field("base").pow(2);
     * ```
     *
     * @param exponent - The constant value to raise this expression to the power of.
     * @returns A new `Expression` representing the power operation.
     */
    pow(exponent: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that truncates the numeric value to an integer.
     *
     * @example
     * ```typescript
     * // Truncate the 'rating' field
     * field("rating").trunc();
     * ```
     *
     * @returns A new `Expression` representing the truncated value.
     */
    trunc(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that truncates a numeric value to the specified number of decimal places.
     *
     * @example
     * ```typescript
     * // Truncate the value of the 'rating' field to two decimal places.
     * field("rating").trunc(2);
     * ```
     *
     * @param decimalPlaces - A constant specifying the truncation precision in decimal places.
     * @returns A new `Expression` representing the truncated value.
     */
    trunc(decimalPlaces: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that truncates a numeric value to the specified number of decimal places.
     *
     * @example
     * ```typescript
     * // Truncate the value of the 'rating' field to two decimal places.
     * field("rating").trunc(constant(2));
     * ```
     *
     * @param decimalPlaces - An expression specifying the truncation precision in decimal places.
     * @returns A new `Expression` representing the truncated value.
     */
    trunc(decimalPlaces: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that rounds a numeric value to the nearest whole number.
     *
     * @example
     * ```typescript
     * // Round the value of the 'price' field.
     * field("price").round();
     * ```
     *
     * @returns A new `Expression` representing the rounded value.
     */
    round(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that rounds a numeric value to the specified number of decimal places.
     *
     * @example
     * ```typescript
     * // Round the value of the 'price' field to two decimal places.
     * field("price").round(2);
     * ```
     *
     * @param decimalPlaces - A constant specifying the rounding precision in decimal places.
     *
     * @returns A new `Expression` representing the rounded value.
     */
    round(decimalPlaces: number): FunctionExpression;
    /**
     * @beta
     * Creates an expression that rounds a numeric value to the specified number of decimal places.
     *
     * @example
     * ```typescript
     * // Round the value of the 'price' field to two decimal places.
     * field("price").round(constant(2));
     * ```
     *
     * @param decimalPlaces - An expression specifying the rounding precision in decimal places.
     *
     * @returns A new `Expression` representing the rounded value.
     */
    round(decimalPlaces: Expression): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the collection ID from a path.
     *
     * @example
     * ```typescript
     * // Get the collection ID from a path.
     * field("__path__").collectionId();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the collectionId operation.
     */
    collectionId(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that calculates the length of a string, array, map, vector, or bytes.
     *
     * @example
     * ```typescript
     * // Get the length of the 'name' field.
     * field("name").length();
     *
     * // Get the number of items in the 'cart' array.
     * field("cart").length();
     * ```
     *
     * @returns A new `Expression` representing the length of the string, array, map, vector, or bytes.
     */
    length(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the natural logarithm of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the natural logarithm of the 'value' field.
     * field("value").ln();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the natural logarithm of the numeric value.
     */
    ln(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the square root of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the square root of the 'value' field.
     * field("value").sqrt();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the square root of the numeric value.
     */
    sqrt(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that reverses a string.
     *
     * @example
     * ```typescript
     * // Reverse the value of the 'myString' field.
     * field("myString").stringReverse();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
     */
    stringReverse(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that returns the `elseValue` argument if this expression results in an absent value, else
     * return the result of the this expression evaluation.
     *
     * @example
     * ```typescript
     * // Returns the value of the optional field 'optional_field', or returns 'default_value'
     * // if the field is absent.
     * field("optional_field").ifAbsent("default_value")
     * ```
     *
     * @param elseValue - The value that will be returned if this Expression evaluates to an absent value.
     * @returns A new [Expression] representing the ifAbsent operation.
     */
    ifAbsent(elseValue: unknown): Expression;
    /**
     * @beta
     * Creates an expression that returns the `elseValue` argument if this expression results in an absent value, else
     * return the result of this expression evaluation.
     *
     * ```typescript
     * // Returns the value of the optional field 'optional_field', or if that is
     * // absent, then returns the value of the field `
     * field("optional_field").ifAbsent(field('default_field'))
     * ```
     *
     * @param elseExpression - The Expression that will be evaluated if this Expression evaluates to an absent value.
     * @returns A new [Expression] representing the ifAbsent operation.
     */
    ifAbsent(elseExpression: unknown): Expression;
    /**
     * @beta
     * Creates an expression that joins the elements of an array into a string.
     *
     * @example
     * ```typescript
     * // Join the elements of the 'tags' field with the delimiter from the 'separator' field.
     * field("tags").join(field("separator"))
     * ```
     *
     * @param delimiterExpression - The expression that evaluates to the delimiter string.
     * @returns A new Expression representing the join operation.
     */
    join(delimiterExpression: Expression): Expression;
    /**
     * @beta
     * Creates an expression that joins the elements of an array field into a string.
     *
     * @example
     * ```typescript
     * // Join the elements of the 'tags' field with a comma and space.
     * field("tags").join(", ")
     * ```
     *
     * @param delimiter - The string to use as a delimiter.
     * @returns A new Expression representing the join operation.
     */
    join(delimiter: string): Expression;
    /**
     * @beta
     * Creates an expression that computes the base-10 logarithm of a numeric value.
     *
     * @example
     * ```typescript
     * // Compute the base-10 logarithm of the 'value' field.
     * field("value").log10();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the base-10 logarithm of the numeric value.
     */
    log10(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that computes the sum of the elements in an array.
     *
     * @example
     * ```typescript
     * // Compute the sum of the elements in the 'scores' field.
     * field("scores").arraySum();
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the sum of the elements in the array.
     */
    arraySum(): FunctionExpression;
    /**
     * @beta
     * Creates an expression that splits the result of this expression into an
     * array of substrings based on the provided delimiter.
     *
     * @example
     * ```typescript
     * // Split the 'scoresCsv' field on delimiter ','
     * field('scoresCsv').split(',')
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
     */
    split(delimiter: string): FunctionExpression;
    /**
     * @beta
     * Creates an expression that splits the result of this expression into an
     * array of substrings based on the provided delimiter.
     *
     * @example
     * ```typescript
     * // Split the 'scores' field on delimiter ',' or ':' depending on the stored format
     * field('scores').split(conditional(field('format').equal('csv'), constant(','), constant(':'))
     * ```
     *
     * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
     */
    split(delimiter: Expression): FunctionExpression;
    /**
     * Creates an expression that truncates a timestamp to a specified granularity.
     *
     * @example
     * ```typescript
     * // Truncate the 'createdAt' timestamp to the beginning of the day.
     * field('createdAt').timestampTruncate('day')
     * ```
     *
     * @param granularity - The granularity to truncate to.
     * @param timezone - The timezone to use for truncation. Valid values are from
     * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
     * @returns A new `Expression` representing the truncated timestamp.
     */
    timestampTruncate(granularity: TimeGranularity, timezone?: string | Expression): FunctionExpression;
    /**
     * Creates an expression that truncates a timestamp to a specified granularity.
     *
     * @example
     * ```typescript
     * // Truncate the 'createdAt' timestamp to the granularity specified in the field 'granularity'.
     * field('createdAt').timestampTruncate(field('granularity'))
     * ```
     *
     * @param granularity - The granularity to truncate to.
     * @param timezone - The timezone to use for truncation. Valid values are from
     * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
     * @returns A new `Expression` representing the truncated timestamp.
     */
    timestampTruncate(granularity: Expression, timezone?: string | Expression): FunctionExpression;
    /**
     * @beta
     * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in ascending order based on this expression.
     *
     * @example
     * ```typescript
     * // Sort documents by the 'name' field in ascending order
     * pipeline().collection("users")
     *   .sort(field("name").ascending());
     * ```
     *
     * @returns A new `Ordering` for ascending sorting.
     */
    ascending(): Ordering;
    /**
     * @beta
     * Creates an {@link @firebase/firestore/pipelines#Ordering} that sorts documents in descending order based on this expression.
     *
     * @example
     * ```typescript
     * // Sort documents by the 'createdAt' field in descending order
     * firestore.pipeline().collection("users")
     *   .sort(field("createdAt").descending());
     * ```
     *
     * @returns A new `Ordering` for descending sorting.
     */
    descending(): Ordering;
    /**
     * @beta
     * Assigns an alias to this expression.
     *
     * Aliases are useful for renaming fields in the output of a stage or for giving meaningful
     * names to calculated values.
     *
     * @example
     * ```typescript
     * // Calculate the total price and assign it the alias "totalPrice" and add it to the output.
     * firestore.pipeline().collection("items")
     *   .addFields(field("price").multiply(field("quantity")).as("totalPrice"));
     * ```
     *
     * @param name - The alias to assign to this expression.
     * @returns A new {@link @firebase/firestore/pipelines#AliasedExpression} that wraps this
     *     expression and associates it with the provided alias.
     */
    as(name: string): AliasedExpression;
}
/**
 * @beta
 *
 * An enumeration of the different types of expressions.
 */
export declare type ExpressionType = 'Field' | 'Constant' | 'Function' | 'AggregateFunction' | 'ListOfExpressions' | 'AliasedExpression';
/**
 * @beta
 *
 * Represents a reference to a field in a Firestore document, or outputs of a {@link @firebase/firestore/pipelines#Pipeline} stage.
 *
 * <p>Field references are used to access document field values in expressions and to specify fields
 * for sorting, filtering, and projecting data in Firestore pipelines.
 *
 * <p>You can create a `Field` instance using the static {@link @firebase/firestore/pipelines#field} method:
 *
 * @example
 * ```typescript
 * // Create a Field instance for the 'name' field
 * const nameField = field("name");
 *
 * // Create a Field instance for a nested field 'address.city'
 * const cityField = field("address.city");
 * ```
 */
export declare class Field extends Expression implements Selectable {
    private fieldPath;
    readonly expressionType: ExpressionType;
    selectable: true;
    /* Excluded from this release type: __constructor */
    get fieldName(): string;
    get alias(): string;
    get expr(): Expression;
}
/**
 * @beta
 * Creates a {@link @firebase/firestore/pipelines#Field} instance representing the field at the given path.
 *
 * The path can be a simple field name (e.g., "name") or a dot-separated path to a nested field
 * (e.g., "address.city").
 *
 * @example
 * ```typescript
 * // Create a Field instance for the 'title' field
 * const titleField = field("title");
 *
 * // Create a Field instance for a nested field 'author.firstName'
 * const authorFirstNameField = field("author.firstName");
 * ```
 *
 * @param name - The path to the field.
 * @returns A new {@link @firebase/firestore/pipelines#Field} instance representing the specified field.
 */
export declare function field(name: string): Field;
/**
 * @beta
 * Creates a {@link @firebase/firestore/pipelines#Field} instance representing the field at the given path.
 *
 * @param path - A FieldPath specifying the field.
 * @returns A new {@link @firebase/firestore/pipelines#Field} instance representing the specified field.
 */
export declare function field(path: FieldPath): Field;
/**
 * @beta
 * Options defining how a FindNearestStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(findNearest:1)}.
 */
export declare type FindNearestStageOptions = StageOptions & {
    /**
     * @beta
     * Specifies the field to be used. This can be a string representing the field path
     * (e.g., 'fieldName', 'nested.fieldName') or an object of type {@link @firebase/firestore/pipelines#Field}
     * representing a more complex field expression.
     */
    field: Field | string;
    /**
     * @beta
     * Specifies the query vector value, to which the vector distance will be computed.
     */
    vectorValue: VectorValue | number[];
    /**
     * @beta
     * Specifies the method used to compute the distance between vectors.
     *
     * Possible values are:
     * - `'euclidean'`: Euclidean distance.
     * - `'cosine'`: Cosine similarity.
     * - `'dot_product'`: Dot product.
     */
    distanceMeasure: 'euclidean' | 'cosine' | 'dot_product';
    /**
     * @beta
     * The maximum number of documents to return from the FindNearest stage.
     */
    limit?: number;
    /**
     * @beta
     * If set, specifies the field on the output documents that will contain
     * the computed vector distance for the document. If not set, the computed
     * vector distance will not be returned.
     */
    distanceField?: string;
};
/**
 * @beta
 * Creates an aggregation that finds the first value of an expression across multiple stage
 * inputs.
 *
 * @example
 * ```typescript
 * // Find the first value of the 'rating' field
 * first(field("rating")).as("firstRating");
 * ```
 *
 * @param expression - The expression to find the first value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'first' aggregation.
 */
export declare function first(expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that finds the first value of a field across multiple stage inputs.
 *
 * @example
 * ```typescript
 * // Find the first value of the 'rating' field
 * first("rating").as("firstRating");
 * ```
 *
 * @param fieldName - The name of the field to find the first value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'first' aggregation.
 */
export declare function first(fieldName: string): AggregateFunction;
/* Excluded from this release type: FirstPartyCredentialsSettings */
/**
 * @beta
 * Creates an expression that computes the floor of a numeric value.
 *
 * @param expr - The expression to compute the floor of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the floor of the numeric value.
 */
export declare function floor(expr: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the floor of a numeric value.
 *
 * @param fieldName - The name of the field to compute the floor of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the floor of the numeric value.
 */
export declare function floor(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * This class defines the base class for Firestore {@link @firebase/firestore/pipelines#Pipeline} functions, which can be evaluated within pipeline
 * execution.
 *
 * Typically, you would not use this class or its children directly. Use either the functions like {@link @firebase/firestore/pipelines#and}, {@link @firebase/firestore/pipelines#(equal:1)},
 * or the methods on {@link @firebase/firestore/pipelines#Expression} ({@link @firebase/firestore/pipelines#Expression.(equal:1)}, {@link @firebase/firestore/pipelines#Expression.(lessThan:1)}, etc.) to construct new Function instances.
 */
export declare class FunctionExpression extends Expression {
    private name;
    private params;
    readonly expressionType: ExpressionType;
    constructor(name: string, params: Expression[]);
    constructor(name: string, params: Expression[], _methodName: string | undefined);
}
/**
 * @beta
 *
 * Creates an expression that checks if the first expression is greater than the second
 * expression.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is greater than 18
 * greaterThan(field("age"), Constant(9).add(9));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the greater than comparison.
 */
export declare function greaterThan(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is greater than a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is greater than 18
 * greaterThan(field("age"), 18);
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the greater than comparison.
 */
export declare function greaterThan(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is greater than an expression.
 *
 * @example
 * ```typescript
 * // Check if the value of field 'age' is greater than the value of field 'limit'
 * greaterThan("age", field("limit"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param expression - The expression to compare to.
 * @returns A new `Expression` representing the greater than comparison.
 */
export declare function greaterThan(fieldName: string, expression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is greater than a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'price' field is greater than 100
 * greaterThan("price", 100);
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the greater than comparison.
 */
export declare function greaterThan(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if the first expression is greater than or equal to the
 * second expression.
 *
 * @example
 * ```typescript
 * // Check if the 'quantity' field is greater than or equal to the field "threshold"
 * greaterThanOrEqual(field("quantity"), field("threshold"));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the greater than or equal to comparison.
 */
export declare function greaterThanOrEqual(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is greater than or equal to a constant
 * value.
 *
 * @example
 * ```typescript
 * // Check if the 'quantity' field is greater than or equal to 10
 * greaterThanOrEqual(field("quantity"), 10);
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the greater than or equal to comparison.
 */
export declare function greaterThanOrEqual(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is greater than or equal to an expression.
 *
 * @example
 * ```typescript
 * // Check if the value of field 'age' is greater than or equal to the value of field 'limit'
 * greaterThanOrEqual("age", field("limit"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The expression to compare to.
 * @returns A new `Expression` representing the greater than or equal to comparison.
 */
export declare function greaterThanOrEqual(fieldName: string, value: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is greater than or equal to a constant
 * value.
 *
 * @example
 * ```typescript
 * // Check if the 'score' field is greater than or equal to 80
 * greaterThanOrEqual("score", 80);
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the greater than or equal to comparison.
 */
export declare function greaterThanOrEqual(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 * Creates an expression that returns the `elseExpr` argument if `ifExpr` is absent, else return
 * the result of the `ifExpr` argument evaluation.
 *
 * @example
 * ```typescript
 * // Returns the value of the optional field 'optional_field', or returns 'default_value'
 * // if the field is absent.
 * ifAbsent(field("optional_field"), constant("default_value"))
 * ```
 *
 * @param ifExpr - The expression to check for absence.
 * @param elseExpr - The expression that will be evaluated and returned if [ifExpr] is absent.
 * @returns A new Expression representing the ifAbsent operation.
 */
export declare function ifAbsent(ifExpr: Expression, elseExpr: Expression): Expression;
/**
 * @beta
 * Creates an expression that returns the `elseValue` argument if `ifExpr` is absent, else
 * return the result of the `ifExpr` argument evaluation.
 *
 * @example
 * ```typescript
 * // Returns the value of the optional field 'optional_field', or returns 'default_value'
 * // if the field is absent.
 * ifAbsent(field("optional_field"), "default_value")
 * ```
 *
 * @param ifExpr - The expression to check for absence.
 * @param elseValue - The value that will be returned if `ifExpr` evaluates to an absent value.
 * @returns A new [Expression] representing the ifAbsent operation.
 */
export declare function ifAbsent(ifExpr: Expression, elseValue: unknown): Expression;
/**
 * @beta
 * Creates an expression that returns the `elseExpr` argument if `ifFieldName` is absent, else
 * return the value of the field.
 *
 * @example
 * ```typescript
 * // Returns the value of the optional field 'optional_field', or returns the value of
 * // 'default_field' if 'optional_field' is absent.
 * ifAbsent("optional_field", field("default_field"))
 * ```
 *
 * @param ifFieldName - The field to check for absence.
 * @param elseExpr - The expression that will be evaluated and returned if `ifFieldName` is
 * absent.
 * @returns A new Expression representing the ifAbsent operation.
 */
export declare function ifAbsent(ifFieldName: string, elseExpr: Expression): Expression;
/**
 * @beta
 * Creates an expression that returns the `elseValue` argument if `ifFieldName` is absent, else
 * return the value of the field.
 *
 * @example
 * ```typescript
 * // Returns the value of the optional field 'optional_field', or returns 'default_value'
 * // if the field is absent.
 * ifAbsent("optional_field", "default_value")
 * ```
 *
 * @param ifFieldName - The field to check for absence.
 * @param elseValue - The value that will be returned if [ifFieldName] is absent.
 * @returns A new Expression representing the ifAbsent operation.
 */
export declare function ifAbsent(ifFieldName: string | Expression, elseValue: Expression | unknown): Expression;
/**
 * @beta
 *
 * Creates an expression that returns the `catch` argument if there is an
 * error, else return the result of the `try` argument evaluation.
 *
 * This overload is useful when a BooleanExpression is required.
 *
 * @example
 * ```typescript
 * // Create an expression that protects against a divide by zero error
 * // but always returns a boolean expression.
 * ifError(constant(50).divide('length').gt(1), constant(false));
 * ```
 *
 * @param tryExpr - The try expression.
 * @param catchExpr - The catch expression that will be evaluated and
 * returned if the tryExpr produces an error.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
 */
export declare function ifError(tryExpr: BooleanExpression, catchExpr: BooleanExpression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that returns the `catch` argument if there is an
 * error, else return the result of the `try` argument evaluation.
 *
 * @example
 * ```typescript
 * // Returns the first item in the title field arrays, or returns
 * // the entire title field if the array is empty or the field is another type.
 * ifError(field("title").arrayGet(0), field("title"));
 * ```
 *
 * @param tryExpr - The try expression.
 * @param catchExpr - The catch expression that will be evaluated and
 * returned if the tryExpr produces an error.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
 */
export declare function ifError(tryExpr: Expression, catchExpr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the `catch` argument if there is an
 * error, else return the result of the `try` argument evaluation.
 *
 * @example
 * ```typescript
 * // Returns the first item in the title field arrays, or returns
 * // "Default Title"
 * ifError(field("title").arrayGet(0), "Default Title");
 * ```
 *
 * @param tryExpr - The try expression.
 * @param catchValue - The value that will be returned if the tryExpr produces an
 * error.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'ifError' operation.
 */
export declare function ifError(tryExpr: Expression, catchValue: unknown): FunctionExpression;
/* Excluded from this release type: _internalPipelineToExecutePipelineRequestProto */
/**
 * @beta
 *
 * Creates an expression that returns `true` if a value is absent. Otherwise,
 * returns `false` even if the value is `null`.
 *
 * @example
 * ```typescript
 * // Check if the field `value` is absent.
 * isAbsent(field("value"));
 * ```
 *
 * @param value - The expression to check.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'isAbsent' check.
 */
export declare function isAbsent(value: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that returns `true` if a field is absent. Otherwise,
 * returns `false` even if the field value is `null`.
 *
 * @example
 * ```typescript
 * // Check if the field `value` is absent.
 * isAbsent("value");
 * ```
 *
 * @param field - The field to check.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'isAbsent' check.
 */
export declare function isAbsent(field: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a given expression produces an error.
 *
 * @example
 * ```typescript
 * // Check if the result of a calculation is an error
 * isError(field("title").arrayContains(1));
 * ```
 *
 * @param value - The expression to check.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'isError' check.
 */
export declare function isError(value: Expression): BooleanExpression;
/**
 * @beta
 * Creates an expression that checks if the value in the specified field is of the given type.
 *
 * @remarks Null or undefined fields evaluate to skip/error. Use `ifAbsent()` / `isAbsent()` to evaluate missing data.
 *
 * @example
 * ```typescript
 * // Check if the 'price' field is a floating point number (evaluating to true inside pipeline conditionals)
 * isType('price', 'float64');
 * ```
 *
 * @param fieldName - The name of the field to check.
 * @param type - The type to check for.
 * @returns A new `BooleanExpression` that evaluates to true if the field's value is of the given type, false otherwise.
 */
export declare function isType(fieldName: string, type: Type): BooleanExpression;
/**
 * @beta
 * Creates an expression that checks if the result of an expression is of the given type.
 *
 * @remarks Null or undefined fields evaluate to skip/error. Use `ifAbsent()` / `isAbsent()` to evaluate missing data.
 *
 * @example
 * ```typescript
 * // Check if the result of a calculation is a number
 * isType(add('count', 1), 'number')
 * ```
 *
 * @param expression - The expression to check.
 * @param type - The type to check for.
 * @returns A new `BooleanExpression` that evaluates to true if the expression's result is of the given type, false otherwise.
 */
export declare function isType(expression: Expression, type: Type): BooleanExpression;
/**
 * @beta
 * Creates an expression that joins the elements of an array into a string.
 *
 * @example
 * ```typescript
 * // Join the elements of the 'tags' field with a comma and space.
 * join("tags", ", ")
 * ```
 *
 * @param arrayFieldName - The name of the field containing the array.
 * @param delimiter - The string to use as a delimiter.
 * @returns A new Expression representing the join operation.
 */
export declare function join(arrayFieldName: string, delimiter: string): Expression;
/**
 * @beta
 * Creates an expression that joins the elements of an array into a string.
 *
 * @example
 * ```typescript
 * // Join an array of string using the delimiter from the 'separator' field.
 * join(array(['foo', 'bar']), field("separator"))
 * ```
 *
 * @param arrayExpression - An expression that evaluates to an array.
 * @param delimiterExpression - The expression that evaluates to the delimiter string.
 * @returns A new Expression representing the join operation.
 */
export declare function join(arrayExpression: Expression, delimiterExpression: Expression): Expression;
/**
 * @beta
 * Creates an expression that joins the elements of an array into a string.
 *
 * @example
 * ```typescript
 * // Join the elements of the 'tags' field with a comma and space.
 * join(field("tags"), ", ")
 * ```
 *
 * @param arrayExpression - An expression that evaluates to an array.
 * @param delimiter - The string to use as a delimiter.
 * @returns A new Expression representing the join operation.
 */
export declare function join(arrayExpression: Expression, delimiter: string): Expression;
/**
 * @beta
 * Creates an expression that joins the elements of an array into a string.
 *
 * @example
 * ```typescript
 * // Join the elements of the 'tags' field with the delimiter from the 'separator' field.
 * join('tags', field("separator"))
 * ```
 *
 * @param arrayFieldName - The name of the field containing the array.
 * @param delimiterExpression - The expression that evaluates to the delimiter string.
 * @returns A new Expression representing the join operation.
 */
export declare function join(arrayFieldName: string, delimiterExpression: Expression): Expression;
/**
 * @beta
 * Creates an aggregation that finds the last value of an expression across multiple stage
 * inputs.
 *
 * @example
 * ```typescript
 * // Find the last value of the 'rating' field
 * last(field("rating")).as("lastRating");
 * ```
 *
 * @param expression - The expression to find the last value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'last' aggregation.
 */
export declare function last(expression: Expression): AggregateFunction;
/**
 * @beta
 * Creates an aggregation that finds the last value of a field across multiple stage inputs.
 *
 * @example
 * ```typescript
 * // Find the last value of the 'rating' field
 * last("rating").as("lastRating");
 * ```
 *
 * @param fieldName - The name of the field to find the last value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'last' aggregation.
 */
export declare function last(fieldName: string): AggregateFunction;
/**
 * @beta
 * Creates an expression that calculates the length of a string, array, map, vector, or bytes.
 *
 * @example
 * ```typescript
 * // Get the length of the 'name' field.
 * length("name");
 *
 * // Get the number of items in the 'cart' array.
 * length("cart");
 * ```
 *
 * @param fieldName - The name of the field to calculate the length of.
 * @returns A new `Expression` representing the length of the string, array, map, vector, or bytes.
 */
declare function length_2(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that calculates the length of a string, array, map, vector, or bytes.
 *
 * @example
 * ```typescript
 * // Get the length of the 'name' field.
 * length(field("name"));
 *
 * // Get the number of items in the 'cart' array.
 * length(field("cart"));
 * ```
 *
 * @param expression - An expression evaluating to a string, array, map, vector, or bytes, which the length will be calculated for.
 * @returns A new `Expression` representing the length of the string, array, map, vector, or bytes.
 */
declare function length_2(expression: Expression): FunctionExpression;
export { length_2 as length };
/**
 * @beta
 *
 * Creates an expression that checks if the first expression is less than the second expression.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is less than 30
 * lessThan(field("age"), field("limit"));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the less than comparison.
 */
export declare function lessThan(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is less than a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is less than 30
 * lessThan(field("age"), 30);
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the less than comparison.
 */
export declare function lessThan(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is less than an expression.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is less than the 'limit' field
 * lessThan("age", field("limit"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param expression - The expression to compare to.
 * @returns A new `Expression` representing the less than comparison.
 */
export declare function lessThan(fieldName: string, expression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is less than a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'price' field is less than 50
 * lessThan("price", 50);
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the less than comparison.
 */
export declare function lessThan(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if the first expression is less than or equal to the second
 * expression.
 *
 * @example
 * ```typescript
 * // Check if the 'quantity' field is less than or equal to 20
 * lessThan(field("quantity"), field("limit"));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the less than or equal to comparison.
 */
export declare function lessThanOrEqual(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is less than or equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'quantity' field is less than or equal to 20
 * lessThan(field("quantity"), 20);
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the less than or equal to comparison.
 */
export declare function lessThanOrEqual(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 * Creates an expression that checks if a field's value is less than or equal to an expression.
 *
 * @example
 * ```typescript
 * // Check if the 'quantity' field is less than or equal to the 'limit' field
 * lessThan("quantity", field("limit"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param expression - The expression to compare to.
 * @returns A new `Expression` representing the less than or equal to comparison.
 */
export declare function lessThanOrEqual(fieldName: string, expression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is less than or equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'score' field is less than or equal to 70
 * lessThan("score", 70);
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the less than or equal to comparison.
 */
export declare function lessThanOrEqual(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that performs a case-sensitive wildcard string comparison against a
 * field.
 *
 * @example
 * ```typescript
 * // Check if the 'title' field contains the string "guide"
 * like("title", "%guide%");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'like' comparison.
 */
export declare function like(fieldName: string, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that performs a case-sensitive wildcard string comparison against a
 * field.
 *
 * @example
 * ```typescript
 * // Check if the 'title' field contains the string "guide"
 * like("title", field("pattern"));
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'like' comparison.
 */
export declare function like(fieldName: string, pattern: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that performs a case-sensitive wildcard string comparison.
 *
 * @example
 * ```typescript
 * // Check if the 'title' field contains the string "guide"
 * like(field("title"), "%guide%");
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'like' comparison.
 */
export declare function like(stringExpression: Expression, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that performs a case-sensitive wildcard string comparison.
 *
 * @example
 * ```typescript
 * // Check if the 'title' field contains the string "guide"
 * like(field("title"), field("pattern"));
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param pattern - The pattern to search for. You can use "%" as a wildcard character.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'like' comparison.
 */
export declare function like(stringExpression: Expression, pattern: Expression): BooleanExpression;
/**
 * @beta
 * Options defining how a LimitStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(limit:1)}.
 */
export declare type LimitStageOptions = StageOptions & {
    /**
     * @beta
     * The maximum number of documents to return.
     */
    limit: number;
};
/**
 * @beta
 * Creates an expression that computes the natural logarithm of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the natural logarithm of the 'value' field.
 * ln("value");
 * ```
 *
 * @param fieldName - The name of the field to compute the natural logarithm of.
 * @returns A new `Expression` representing the natural logarithm of the numeric value.
 */
export declare function ln(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the natural logarithm of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the natural logarithm of the 'value' field.
 * ln(field("value"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the natural logarithm will be computed for.
 * @returns A new `Expression` representing the natural logarithm of the numeric value.
 */
export declare function ln(expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the logarithm of an expression to a given base.
 *
 * @example
 * ```typescript
 * // Compute the logarithm of the 'value' field with base 10.
 * log(field("value"), 10);
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the logarithm will be computed for.
 * @param base - The base of the logarithm.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logarithm of the numeric value.
 */
export declare function log(expression: Expression, base: number): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the logarithm of an expression to a given base.
 *
 * @example
 * ```typescript
 * // Compute the logarithm of the 'value' field with the base in the 'base' field.
 * log(field("value"), field("base"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the logarithm will be computed for.
 * @param base - The base of the logarithm.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logarithm of the numeric value.
 */
export declare function log(expression: Expression, base: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the logarithm of a field to a given base.
 *
 * @example
 * ```typescript
 * // Compute the logarithm of the 'value' field with base 10.
 * log("value", 10);
 * ```
 *
 * @param fieldName - The name of the field to compute the logarithm of.
 * @param base - The base of the logarithm.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logarithm of the numeric value.
 */
export declare function log(fieldName: string, base: number): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the logarithm of a field to a given base.
 *
 * @example
 * ```typescript
 * // Compute the logarithm of the 'value' field with the base in the 'base' field.
 * log("value", field("base"));
 * ```
 *
 * @param fieldName - The name of the field to compute the logarithm of.
 * @param base - The base of the logarithm.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logarithm of the numeric value.
 */
export declare function log(fieldName: string, base: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the base-10 logarithm of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the base-10 logarithm of the 'value' field.
 * log10("value");
 * ```
 *
 * @param fieldName - The name of the field to compute the base-10 logarithm of.
 * @returns A new `Expression` representing the base-10 logarithm of the numeric value.
 */
export declare function log10(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the base-10 logarithm of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the base-10 logarithm of the 'value' field.
 * log10(field("value"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the base-10 logarithm will be computed for.
 * @returns A new `Expression` representing the base-10 logarithm of the numeric value.
 */
export declare function log10(expression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the largest value between multiple input
 * expressions or literal values. Based on Firestore's value type ordering.
 *
 * @example
 * ```typescript
 * // Returns the largest value between the 'field1' field, the 'field2' field,
 * // and 1000
 * logicalMaximum(field("field1"), field("field2"), 1000);
 * ```
 *
 * @param first - The first operand expression.
 * @param second - The second expression or literal.
 * @param others - Optional additional expressions or literals.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical maximum operation.
 */
export declare function logicalMaximum(first: Expression, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the largest value between multiple input
 * expressions or literal values. Based on Firestore's value type ordering.
 *
 * @example
 * ```typescript
 * // Returns the largest value between the 'field1' field, the 'field2' field,
 * // and 1000.
 * logicalMaximum("field1", field("field2"), 1000);
 * ```
 *
 * @param fieldName - The first operand field name.
 * @param second - The second expression or literal.
 * @param others - Optional additional expressions or literals.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical maximum operation.
 */
export declare function logicalMaximum(fieldName: string, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the smallest value between multiple input
 * expressions and literal values. Based on Firestore's value type ordering.
 *
 * @example
 * ```typescript
 * // Returns the smallest value between the 'field1' field, the 'field2' field,
 * // and 1000.
 * logicalMinimum(field("field1"), field("field2"), 1000);
 * ```
 *
 * @param first - The first operand expression.
 * @param second - The second expression or literal.
 * @param others - Optional additional expressions or literals.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical minimum operation.
 */
export declare function logicalMinimum(first: Expression, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the smallest value between a field's value
 * and other input expressions or literal values.
 * Based on Firestore's value type ordering.
 *
 * @example
 * ```typescript
 * // Returns the smallest value between the 'field1' field, the 'field2' field,
 * // and 1000.
 * logicalMinimum("field1", field("field2"), 1000);
 * ```
 *
 * @param fieldName - The first operand field name.
 * @param second - The second expression or literal.
 * @param others - Optional additional expressions or literals.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical minimum operation.
 */
export declare function logicalMinimum(fieldName: string, second: Expression | unknown, ...others: Array<Expression | unknown>): FunctionExpression;
/**
 * @beta
 * Trims whitespace or a specified set of characters/bytes from the beginning of a string or byte array.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the beginning of the 'userInput' field
 * ltrim(field("userInput"));
 *
 * // Trim quotes from the beginning of the 'userInput' field
 * ltrim(field("userInput"), '"');
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
 * If not specified, whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string or byte array.
 */
export declare function ltrim(fieldName: string, valueToTrim?: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Trims whitespace or a specified set of characters/bytes from the beginning of a string or byte array.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the beginning of the 'userInput' field
 * ltrim(field("userInput"));
 *
 * // Trim quotes from the beginning of the 'userInput' field
 * ltrim(field("userInput"), '"');
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
 * If not specified, whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string or byte array.
 */
export declare function ltrim(expression: Expression, valueToTrim?: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that creates a Firestore map value from an input object.
 *
 * @example
 * ```typescript
 * // Create a map from the input object and reference the 'baz' field value from the input document.
 * map({foo: 'bar', baz: Field.of('baz')}).as('data');
 * ```
 *
 * @param elements - The input map to evaluate in the expression.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the map function.
 */
export declare function map(elements: Record<string, unknown>): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the entries of a map as an array of maps,
 * where each map contains a `"k"` property for the key and a `"v"` property for the value.
 * For example: `[{ k: "key1", v: "value1" }, ...]`.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the entries of the 'address' map field
 * mapEntries("address");
 * ```
 *
 * @param mapField - The map field to get the entries of.
 * @returns A new `Expression` representing the entries of the map.
 */
export declare function mapEntries(mapField: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the entries of a map as an array of maps,
 * where each map contains a `"k"` property for the key and a `"v"` property for the value.
 * For example: `[{ k: "key1", v: "value1" }, ...]`.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the entries of the map expression
 * mapEntries(map({"city": "San Francisco"}));
 * ```
 *
 * @param mapExpression - The expression representing the map to get the entries of.
 * @returns A new `Expression` representing the entries of the map.
 */
export declare function mapEntries(mapExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Accesses a value from a map (object) field using the provided key.
 *
 * @example
 * ```typescript
 * // Get the 'city' value from the 'address' map field
 * mapGet("address", "city");
 * ```
 *
 * @param fieldName - The field name of the map field.
 * @param subField - The key to access in the map.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the value associated with the given key in the map.
 */
export declare function mapGet(fieldName: string, subField: string): FunctionExpression;
/**
 * @beta
 *
 * Accesses a value from a map (object) expression using the provided key.
 *
 * @example
 * ```typescript
 * // Get the 'city' value from the 'address' map field
 * mapGet(field("address"), "city");
 * ```
 *
 * @param mapExpression - The expression representing the map.
 * @param subField - The key to access in the map.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the value associated with the given key in the map.
 */
export declare function mapGet(mapExpression: Expression, subField: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the keys of a map.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the keys of the 'address' map field
 * mapKeys("address");
 * ```
 *
 * @param mapField - The map field to get the keys of.
 * @returns A new `Expression` representing the keys of the map.
 */
export declare function mapKeys(mapField: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the keys of a map.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the keys of the map expression
 * mapKeys(map({"city": "San Francisco"}));
 * ```
 *
 * @param mapExpression - The expression representing the map to get the keys of.
 * @returns A new `Expression` representing the keys of the map.
 */
export declare function mapKeys(mapExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that merges multiple map values.
 *
 * @example
 * ```
 * // Merges the map in the settings field with, a map literal, and a map in
 * // that is conditionally returned by another expression
 * mapMerge('settings', { enabled: true }, conditional(field('isAdmin'), { admin: true}, {})
 * ```
 *
 * @param mapField - Name of a field containing a map value that will be merged.
 * @param secondMap - A required second map to merge. Represented as a literal or
 * an expression that returns a map.
 * @param otherMaps - Optional additional maps to merge. Each map is represented
 * as a literal or an expression that returns a map.
 */
export declare function mapMerge(mapField: string, secondMap: Record<string, unknown> | Expression, ...otherMaps: Array<Record<string, unknown> | Expression>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that merges multiple map values.
 *
 * @example
 * ```
 * // Merges the map in the settings field with, a map literal, and a map in
 * // that is conditionally returned by another expression
 * mapMerge(field('settings'), { enabled: true }, conditional(field('isAdmin'), { admin: true}, {})
 * ```
 *
 * @param firstMap - An expression or literal map value that will be merged.
 * @param secondMap - A required second map to merge. Represented as a literal or
 * an expression that returns a map.
 * @param otherMaps - Optional additional maps to merge. Each map is represented
 * as a literal or an expression that returns a map.
 */
export declare function mapMerge(firstMap: Record<string, unknown> | Expression, secondMap: Record<string, unknown> | Expression, ...otherMaps: Array<Record<string, unknown> | Expression>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes a key from the map at the specified field name.
 *
 * @example
 * ```
 * // Removes the key 'city' field from the map in the address field of the input document.
 * mapRemove('address', 'city');
 * ```
 *
 * @param mapField - The name of a field containing a map value.
 * @param key - The name of the key to remove from the input map.
 */
export declare function mapRemove(mapField: string, key: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes a key from the map produced by evaluating an expression.
 *
 * @example
 * ```
 * // Removes the key 'baz' from the input map.
 * mapRemove(map({foo: 'bar', baz: true}), 'baz');
 * @example
 * ```
 *
 * @param mapExpr - An expression return a map value.
 * @param key - The name of the key to remove from the input map.
 */
export declare function mapRemove(mapExpr: Expression, key: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes a key from the map at the specified field name.
 *
 * @example
 * ```
 * // Removes the key 'city' field from the map in the address field of the input document.
 * mapRemove('address', constant('city'));
 * ```
 *
 * @param mapField - The name of a field containing a map value.
 * @param keyExpr - An expression that produces the name of the key to remove from the input map.
 */
export declare function mapRemove(mapField: string, keyExpr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes a key from the map produced by evaluating an expression.
 *
 * @example
 * ```
 * // Removes the key 'baz' from the input map.
 * mapRemove(map({foo: 'bar', baz: true}), constant('baz'));
 * @example
 * ```
 *
 * @param mapExpr - An expression return a map value.
 * @param keyExpr - An expression that produces the name of the key to remove from the input map.
 */
export declare function mapRemove(mapExpr: Expression, keyExpr: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns a new map with the specified entries added or updated.
 *
 * @remarks
 * This only performs shallow updates to the map. Setting a value to `null`
 * will retain the key with a `null` value. To remove a key entirely, use `mapRemove`.
 *
 * @example
 * ```typescript
 * // Set the 'city' to 'San Francisco' in the 'address' map field
 * mapSet("address", "city", "San Francisco");
 * ```
 *
 * @param mapField - The map field to set entries in.
 * @param key - The key to set. Must be a string or a constant string expression.
 * @param value - The value to set.
 * @param moreKeyValues - Additional key-value pairs to set.
 * @returns A new `Expression` representing the map with the entries set.
 */
export declare function mapSet(mapField: string, key: string | Expression, value: unknown, ...moreKeyValues: unknown[]): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns a new map with the specified entries added or updated.
 *
 * @remarks
 * This only performs shallow updates to the map. Setting a value to `null`
 * will retain the key with a `null` value. To remove a key entirely, use `mapRemove`.
 *
 * @example
 * ```typescript
 * // Set the 'city' to "San Francisco"
 * mapSet(map({"state": "California"}), "city", "San Francisco");
 * ```
 *
 * @param mapExpression - The expression representing the map.
 * @param key - The key to set. Must be a string or a constant string expression.
 * @param value - The value to set.
 * @param moreKeyValues - Additional key-value pairs to set.
 * @returns A new `Expression` representing the map with the entries set.
 */
export declare function mapSet(mapExpression: Expression, key: string | Expression, value: unknown, ...moreKeyValues: unknown[]): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the values of a map.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the values of the 'address' map field
 * mapValues("address");
 * ```
 *
 * @param mapField - The map field to get the values of.
 * @returns A new `Expression` representing the values of the map.
 */
export declare function mapValues(mapField: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the values of a map.
 *
 * @remarks
 * While the backend generally preserves insertion order, relying on the
 * order of the output array is not guaranteed and should be avoided.
 *
 * @example
 * ```typescript
 * // Get the values of the map expression
 * mapValues(map({"city": "San Francisco"}));
 * ```
 *
 * @param mapExpression - The expression representing the map to get the values of.
 * @returns A new `Expression` representing the values of the map.
 */
export declare function mapValues(mapExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an aggregation that finds the maximum value of an expression across multiple stage
 * inputs.
 *
 * @example
 * ```typescript
 * // Find the highest score in a leaderboard
 * maximum(field("score")).as("highestScore");
 * ```
 *
 * @param expression - The expression to find the maximum value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'maximum' aggregation.
 */
export declare function maximum(expression: Expression): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that finds the maximum value of a field across multiple stage inputs.
 *
 * @example
 * ```typescript
 * // Find the highest score in a leaderboard
 * maximum("score").as("highestScore");
 * ```
 *
 * @param fieldName - The name of the field to find the maximum value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'maximum' aggregation.
 */
export declare function maximum(fieldName: string): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that finds the minimum value of an expression across multiple stage
 * inputs.
 *
 * @example
 * ```typescript
 * // Find the lowest price of all products
 * minimum(field("price")).as("lowestPrice");
 * ```
 *
 * @param expression - The expression to find the minimum value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'minimum' aggregation.
 */
export declare function minimum(expression: Expression): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that finds the minimum value of a field across multiple stage inputs.
 *
 * @example
 * ```typescript
 * // Find the lowest price of all products
 * minimum("price").as("lowestPrice");
 * ```
 *
 * @param fieldName - The name of the field to find the minimum value of.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'minimum' aggregation.
 */
export declare function minimum(fieldName: string): AggregateFunction;
/**
 * @beta
 *
 * Creates an expression that calculates the modulo (remainder) of dividing two expressions.
 *
 * @example
 * ```typescript
 * // Calculate the remainder of dividing 'field1' by 'field2'.
 * mod(field("field1"), field("field2"));
 * ```
 *
 * @param left - The dividend expression.
 * @param right - The divisor expression.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the modulo operation.
 */
export declare function mod(left: Expression, right: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the modulo (remainder) of dividing an expression by a constant.
 *
 * @example
 * ```typescript
 * // Calculate the remainder of dividing 'field1' by 5.
 * mod(field("field1"), 5);
 * ```
 *
 * @param expression - The dividend expression.
 * @param value - The divisor constant.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the modulo operation.
 */
export declare function mod(expression: Expression, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the modulo (remainder) of dividing a field's value by an expression.
 *
 * @example
 * ```typescript
 * // Calculate the remainder of dividing 'field1' by 'field2'.
 * mod("field1", field("field2"));
 * ```
 *
 * @param fieldName - The dividend field name.
 * @param expression - The divisor expression.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the modulo operation.
 */
export declare function mod(fieldName: string, expression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the modulo (remainder) of dividing a field's value by a constant.
 *
 * @example
 * ```typescript
 * // Calculate the remainder of dividing 'field1' by 5.
 * mod("field1", 5);
 * ```
 *
 * @param fieldName - The dividend field name.
 * @param value - The divisor constant.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the modulo operation.
 */
export declare function mod(fieldName: string, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that multiplies two expressions together.
 *
 * @example
 * ```typescript
 * // Multiply the 'quantity' field by the 'price' field
 * multiply(field("quantity"), field("price"));
 * ```
 *
 * @param first - The first expression to multiply.
 * @param second - The second expression or literal to multiply.
 * @param others - Optional additional expressions or literals to multiply.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the multiplication operation.
 */
export declare function multiply(first: Expression, second: Expression | unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that multiplies a field's value by an expression.
 *
 * @example
 * ```typescript
 * // Multiply the 'quantity' field by the 'price' field
 * multiply("quantity", field("price"));
 * ```
 *
 * @param fieldName - The name of the field containing the value to add.
 * @param second - The second expression or literal to add.
 * @param others - Optional other expressions or literals to add.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the multiplication operation.
 */
export declare function multiply(fieldName: string, second: Expression | unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that negates a filter condition.
 *
 * @example
 * ```typescript
 * // Find documents where the 'completed' field is NOT true
 * not(equal("completed", true));
 * ```
 *
 * @param booleanExpr - The filter condition to negate.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the negated filter condition.
 */
export declare function not(booleanExpr: BooleanExpression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if two expressions are not equal.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is not equal to field 'finalState'
 * notEqual(field("status"), field("finalState"));
 * ```
 *
 * @param left - The first expression to compare.
 * @param right - The second expression to compare.
 * @returns A new `Expression` representing the inequality comparison.
 */
export declare function notEqual(left: Expression, right: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is not equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is not equal to "completed"
 * notEqual(field("status"), "completed");
 * ```
 *
 * @param expression - The expression to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the inequality comparison.
 */
export declare function notEqual(expression: Expression, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is not equal to an expression.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is not equal to the value of 'expectedStatus'
 * notEqual("status", field("expectedStatus"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param expression - The expression to compare to.
 * @returns A new `Expression` representing the inequality comparison.
 */
export declare function notEqual(fieldName: string, expression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is not equal to a constant value.
 *
 * @example
 * ```typescript
 * // Check if the 'country' field is not equal to "USA"
 * notEqual("country", "USA");
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param value - The constant value to compare to.
 * @returns A new `Expression` representing the inequality comparison.
 */
export declare function notEqual(fieldName: string, value: unknown): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is not equal to any of the provided values
 * or expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is neither "pending" nor the value of 'rejectedStatus'
 * notEqualAny(field("status"), ["pending", field("rejectedStatus")]);
 * ```
 *
 * @param element - The expression to compare.
 * @param values - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'NOT IN' comparison.
 */
export declare function notEqualAny(element: Expression, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is not equal to any of the provided values
 * or expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is neither "pending" nor the value of 'rejectedStatus'
 * notEqualAny("status", [constant("pending"), field("rejectedStatus")]);
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param values - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'NOT IN' comparison.
 */
export declare function notEqualAny(fieldName: string, values: Array<Expression | unknown>): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if an expression is not equal to any of the provided values
 * or expressions.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is neither "pending" nor the value of the field 'rejectedStatus'
 * notEqualAny(field("status"), ["pending", field("rejectedStatus")]);
 * ```
 *
 * @param element - The expression to compare.
 * @param arrayExpression - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'NOT IN' comparison.
 */
export declare function notEqualAny(element: Expression, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value is not equal to any of the values in the evaluated expression.
 *
 * @example
 * ```typescript
 * // Check if the 'status' field is not equal to any value in the field 'rejectedStatuses'
 * notEqualAny("status", field("rejectedStatuses"));
 * ```
 *
 * @param fieldName - The field name to compare.
 * @param arrayExpression - The values to check against.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'NOT IN' comparison.
 */
export declare function notEqualAny(fieldName: string, arrayExpression: Expression): BooleanExpression;
/**
 * @beta
 * Options defining how an OffsetStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(offset:1)}.
 */
export declare type OffsetStageOptions = StageOptions & {
    /**
     * @beta
     * The number of documents to skip.
     */
    offset: number;
};
/**
 * @beta
 * Utility type to create an type that only allows one
 * property of the Type param T to be set.
 *
 * @example
 * ```
 * type XorY = OneOf<{ x: unknown, y: unknown }>
 * let a = { x: "foo" }           // OK
 * let b = { y: "foo" }           // OK
 * let c = { a: "foo", y: "foo" } // Not OK
 * ```
 */
export declare type OneOf<T> = {
    [K in keyof T]: Pick<T, K> & {
        [P in Exclude<keyof T, K>]?: undefined;
    };
}[keyof T];
/**
 * @beta
 *
 * Creates an expression that performs a logical 'OR' operation on multiple filter conditions.
 *
 * @example
 * ```typescript
 * // Check if the 'age' field is greater than 18 OR the 'city' field is "London" OR
 * // the 'status' field is "active"
 * const condition = or(greaterThan("age", 18), equal("city", "London"), equal("status", "active"));
 * ```
 *
 * @param first - The first filter condition.
 * @param second - The second filter condition.
 * @param more - Additional filter conditions to 'OR' together.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical 'OR' operation.
 */
export declare function or(first: BooleanExpression, second: BooleanExpression, ...more: BooleanExpression[]): BooleanExpression;
/**
 * @beta
 *
 * Represents an ordering criterion for sorting documents in a Firestore pipeline.
 *
 * You create `Ordering` instances using the `ascending` and `descending` helper functions.
 */
export declare class Ordering {
    readonly expr: Expression;
    readonly direction: 'ascending' | 'descending';
    constructor(expr: Expression, direction: 'ascending' | 'descending', _methodName: string | undefined);
}
/**
 * @beta
 */
export declare class Pipeline {
    addFields(field: Selectable, ...additionalFields: Selectable[]): Pipeline;
    addFields(options: AddFieldsStageOptions): Pipeline;
    removeFields(fieldValue: Field | string, ...additionalFields: Array<Field | string>): Pipeline;
    removeFields(options: RemoveFieldsStageOptions): Pipeline;
    select(selection: Selectable | string, ...additionalSelections: Array<Selectable | string>): Pipeline;
    select(options: SelectStageOptions): Pipeline;
    where(condition: BooleanExpression): Pipeline;
    where(options: WhereStageOptions): Pipeline;
    offset(offset: number): Pipeline;
    offset(options: OffsetStageOptions): Pipeline;
    limit(limit: number): Pipeline;
    limit(options: LimitStageOptions): Pipeline;
    distinct(group: string | Selectable, ...additionalGroups: Array<string | Selectable>): Pipeline;
    distinct(options: DistinctStageOptions): Pipeline;
    aggregate(accumulator: AliasedAggregate, ...additionalAccumulators: AliasedAggregate[]): Pipeline;
    aggregate(options: AggregateStageOptions): Pipeline;
    findNearest(options: FindNearestStageOptions): Pipeline;
    sort(ordering: Ordering, ...additionalOrderings: Ordering[]): Pipeline;
    sort(options: SortStageOptions): Pipeline;
    replaceWith(fieldName: string): Pipeline;
    replaceWith(expr: Expression): Pipeline;
    replaceWith(options: ReplaceWithStageOptions): Pipeline;
    sample(documents: number): Pipeline;
    sample(options: SampleStageOptions): Pipeline;
    union(other: Pipeline): Pipeline;
    union(options: UnionStageOptions): Pipeline;
    unnest(selectable: Selectable, indexField?: string): Pipeline;
    unnest(options: UnnestStageOptions): Pipeline;
    rawStage(name: string, params: unknown[], options?: { [key: string]: Expression | unknown; }): Pipeline;
}
/**
 * @beta
 * Options defining Pipeline execution.
 */
export declare interface PipelineExecuteOptions {
    /**
     * @beta
     * Pipeline to be evaluated.
     */
    pipeline: Pipeline;
    /**
     * @beta
     * Specify the index mode.
     */
    indexMode?: 'recommended';
    /**
     * @beta
     * An escape hatch to set options not known at SDK build time. These values
     * will be passed directly to the Firestore backend and not used by the SDK.
     *
     * The option name will be used as provided. And must match the name
     * format used by the backend (hint: use a snake_case_name).
     *
     * Custom option values can be any type supported
     * by Firestore (for example: string, boolean, number, map, …). Value types
     * not known to the SDK will be rejected.
     *
     * Values specified in rawOptions will take precedence over any options
     * with the same name set by the SDK.
     *
     * @example
     * Override the `example_option`:
     * ```
     *   execute({
     *     pipeline: myPipeline,
     *     rawOptions: {
     *       // Override `example_option`. This will not
     *       // merge with the existing `example_option` object.
     *       "example_option": {
     *         foo: "bar"
     *       }
     *     }
     *   }
     * ```
     *
     * `rawOptions` supports dot notation, if you want to override
     * a nested option.
     * ```
     *   execute({
     *     pipeline: myPipeline,
     *     rawOptions: {
     *       // Override `example_option.foo` and do not override
     *       // any other properties of `example_option`.
     *       "example_option.foo": "bar"
     *     }
     *   }
     * ```
     */
    rawOptions?: {
        [name: string]: unknown;
    };
}
/**
 * @beta
 *
 * A PipelineResult contains data read from a Firestore Pipeline. The data can be extracted with the
 * {@link @firebase/firestore/pipelines#PipelineResult.data} or {@link @firebase/firestore/pipelines#PipelineResult.(get:1)} methods.
 *
 * <p>If the PipelineResult represents a non-document result, `ref` will return a undefined
 * value.
 */
export declare class PipelineResult<AppModelType = DocumentData> {
    /* Excluded from this release type: _ref */
    /* Excluded from this release type: _fields */
    /* Excluded from this release type: __constructor */
    /**
     * @beta
     * The reference of the document, if it is a document; otherwise `undefined`.
     */
    get ref(): DocumentReference | undefined;
    /**
     * @beta
     * The ID of the document for which this PipelineResult contains data, if it is a document; otherwise `undefined`.
     *
     * @readonly
     *
     */
    get id(): string | undefined;
    /**
     * @beta
     * The time the document was created. Undefined if this result is not a document.
     *
     * @readonly
     */
    get createTime(): Timestamp | undefined;
    /**
     * @beta
     * The time the document was last updated (at the time the snapshot was
     * generated). Undefined if this result is not a document.
     *
     * @readonly
     */
    get updateTime(): Timestamp | undefined;
    /**
     * @beta
     * Retrieves all fields in the result as an object.
     *
     * @returns An object containing all fields in the document or
     * 'undefined' if the document doesn't exist.
     *
     * @example
     * ```
     * let p = firestore.pipeline().collection('col');
     *
     * p.execute().then(results => {
     *   let data = results[0].data();
     *   console.log(`Retrieved data: ${JSON.stringify(data)}`);
     * });
     * ```
     */
    data(): AppModelType;
    /* Excluded from this release type: _fieldsProto */
    /**
     * @beta
     * Retrieves the field specified by `field`.
     *
     * @param field - The field path
     * (e.g. 'foo' or 'foo.bar') to a specific field.
     * @returns The data at the specified field location or `undefined` if no
     * such field exists.
     *
     * @example
     * ```
     * let p = firestore.pipeline().collection('col');
     *
     * p.execute().then(results => {
     *   let field = results[0].get('a.b');
     *   console.log(`Retrieved field value: ${field}`);
     * });
     * ```
     */
    get(fieldPath: string | FieldPath | Field): any;
}
/**
 * @beta
 * Test equality of two PipelineResults.
 * @param left - First PipelineResult to compare.
 * @param right - Second PipelineResult to compare.
 */
export declare function pipelineResultEqual(left: PipelineResult, right: PipelineResult): boolean;
/**
 * @beta
 * Represents the results of a Firestore pipeline execution.
 *
 * A `PipelineSnapshot` contains zero or more {@link @firebase/firestore/pipelines#PipelineResult} objects
 * representing the documents returned by a pipeline query. It provides methods
 * to iterate over the documents and access metadata about the query results.
 *
 * @example
 * ```typescript
 * const snapshot: PipelineSnapshot = await firestore
 *   .pipeline()
 *   .collection('myCollection')
 *   .where(field('value').greaterThan(10))
 *   .execute();
 *
 * snapshot.results.forEach(doc => {
 *   console.log(doc.id, '=>', doc.data());
 * });
 * ```
 */
export declare class PipelineSnapshot {
    constructor(pipeline: Pipeline, results: PipelineResult[], executionTime?: Timestamp);
    /**
     * @beta An array of all the results in the `PipelineSnapshot`.
     */
    get results(): PipelineResult[];
    /**
     * @beta
     * The time at which the pipeline producing this result is executed.
     *
     * @readonly
     *
     */
    get executionTime(): Timestamp;
}
/**
 * @beta
 * Provides the entry point for defining the data source of a Firestore {@link @firebase/firestore/pipelines#Pipeline}.
 *
 * Use the methods of this class (e.g., {@link @firebase/firestore/pipelines#PipelineSource.(collection:1)}, {@link @firebase/firestore/pipelines#PipelineSource.(collectionGroup:1)},
 * {@link @firebase/firestore/pipelines#PipelineSource.(database:1)}, or {@link @firebase/firestore/pipelines#PipelineSource.(documents:1)}) to specify the initial data
 * for your pipeline, such as a collection, a collection group, the entire database, or a set of specific documents.
 */
export declare class PipelineSource<PipelineType> {
    private databaseId;
    private userDataReader;
    /* Excluded from this release type: _createPipeline */
    /* Excluded from this release type: __constructor */
    /**
     * @beta
     * Returns all documents from the entire collection. The collection can be nested.
     * @param collection - Name or reference to the collection that will be used as the Pipeline source.
     */
    collection(collection: string | Query): PipelineType;
    /**
     * @beta
     * Returns all documents from the entire collection. The collection can be nested.
     * @param options - Options defining how this CollectionStage is evaluated.
     */
    collection(options: CollectionStageOptions): PipelineType;
    /**
     * @beta
     * Returns all documents from a collection ID regardless of the parent.
     * @param collectionId - ID of the collection group to use as the Pipeline source.
     */
    collectionGroup(collectionId: string): PipelineType;
    /**
     * @beta
     * Returns all documents from a collection ID regardless of the parent.
     * @param options - Options defining how this CollectionGroupStage is evaluated.
     */
    collectionGroup(options: CollectionGroupStageOptions): PipelineType;
    /**
     * @beta
     * Returns all documents from the entire database.
     */
    database(): PipelineType;
    /**
     * @beta
     * Returns all documents from the entire database.
     * @param options - Options defining how a DatabaseStage is evaluated.
     */
    database(options: DatabaseStageOptions): PipelineType;
    /**
     * @beta
     * Set the pipeline's source to the documents specified by the given paths and DocumentReferences.
     *
     * @param docs - An array of paths and DocumentReferences specifying the individual documents that will be the source of this pipeline.
     * The converters for these DocumentReferences will be ignored and not have an effect on this pipeline.
     *
     * @throws `FirestoreError` Thrown if any of the provided DocumentReferences target a different project or database than the pipeline.
     */
    documents(docs: Array<string | DocumentReference>): PipelineType;
    /**
     * @beta
     * Set the pipeline's source to the documents specified by the given paths and DocumentReferences.
     *
     * @param options - Options defining how this DocumentsStage is evaluated.
     *
     * @throws `FirestoreError` Thrown if any of the provided DocumentReferences target a different project or database than the pipeline.
     */
    documents(options: DocumentsStageOptions): PipelineType;
    /**
     * @beta
     * Convert the given Query into an equivalent Pipeline.
     *
     * @param query - A Query to be converted into a Pipeline.
     *
     * @throws `FirestoreError` Thrown if any of the provided DocumentReferences target a different project or database than the pipeline.
     */
    createFrom(query: Query): Pipeline;
}
/**
 * @beta
 * Creates an expression that returns the value of the base expression raised to the power of the exponent expression.
 *
 * @example
 * ```typescript
 * // Raise the value of the 'base' field to the power of the 'exponent' field.
 * pow(field("base"), field("exponent"));
 * ```
 *
 * @param base - The expression to raise to the power of the exponent.
 * @param exponent - The expression to raise the base to the power of.
 * @returns A new `Expression` representing the power operation.
 */
export declare function pow(base: Expression, exponent: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the value of the base expression raised to the power of the exponent.
 *
 * @example
 * ```typescript
 * // Raise the value of the 'base' field to the power of 2.
 * pow(field("base"), 2);
 * ```
 *
 * @param base - The expression to raise to the power of the exponent.
 * @param exponent - The constant value to raise the base to the power of.
 * @returns A new `Expression` representing the power operation.
 */
export declare function pow(base: Expression, exponent: number): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the value of the base field raised to the power of the exponent expression.
 *
 * @example
 * ```typescript
 * // Raise the value of the 'base' field to the power of the 'exponent' field.
 * pow("base", field("exponent"));
 * ```
 *
 * @param base - The name of the field to raise to the power of the exponent.
 * @param exponent - The expression to raise the base to the power of.
 * @returns A new `Expression` representing the power operation.
 */
export declare function pow(base: string, exponent: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the value of the base field raised to the power of the exponent.
 *
 * @example
 * ```typescript
 * // Raise the value of the 'base' field to the power of 2.
 * pow("base", 2);
 * ```
 *
 * @param base - The name of the field to raise to the power of the exponent.
 * @param exponent - The constant value to raise the base to the power of.
 * @returns A new `Expression` representing the power operation.
 */
export declare function pow(base: string, exponent: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that generates a random number between 0.0 and 1.0 but not including 1.0.
 *
 * @example
 * ```typescript
 * // Generate a random number between 0.0 and 1.0.
 * rand();
 * ```
 *
 * @returns A new `Expression` representing the rand operation.
 */
export declare function rand(): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field contains a specified regular expression as
 * a substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example" (case-insensitive)
 * regexContains("description", "(?i)example");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The regular expression to use for the search.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function regexContains(fieldName: string, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field contains a specified regular expression as
 * a substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example" (case-insensitive)
 * regexContains("description", field("pattern"));
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The regular expression to use for the search.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function regexContains(fieldName: string, pattern: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression contains a specified regular
 * expression as a substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example" (case-insensitive)
 * regexContains(field("description"), "(?i)example");
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param pattern - The regular expression to use for the search.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function regexContains(stringExpression: Expression, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression contains a specified regular
 * expression as a substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example" (case-insensitive)
 * regexContains(field("description"), field("pattern"));
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param pattern - The regular expression to use for the search.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function regexContains(stringExpression: Expression, pattern: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that returns the first substring of a string field that matches a
 * specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract the domain name from an email field
 * regexFind("email", "@[A-Za-z0-9.-]+");
 * ```
 *
 * @param fieldName - The name of the field containing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
 */
export declare function regexFind(fieldName: string, pattern: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the first substring of a string field that matches a
 * specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract a substring from 'email' based on a pattern stored in another field
 * regexFind("email", field("pattern"));
 * ```
 *
 * @param fieldName - The name of the field containing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
 */
export declare function regexFind(fieldName: string, pattern: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the first substring of a string expression that matches
 * a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract the domain from a lower-cased email address
 * regexFind(field("email"), "@[A-Za-z0-9.-]+");
 * ```
 *
 * @param stringExpression - The expression representing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
 */
export declare function regexFind(stringExpression: Expression, pattern: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns the first substring of a string expression that matches
 * a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract a substring based on a dynamic pattern field
 * regexFind(field("email"), field("pattern"));
 * ```
 *
 * @param stringExpression - The expression representing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression find function.
 */
export declare function regexFind(stringExpression: Expression, pattern: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that evaluates to a list of all substrings in a string field that
 * match a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract all hashtags from a post content field
 * regexFindAll("content", "#[A-Za-z0-9_]+");
 * ```
 *
 * @param fieldName - The name of the field containing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#FunctionExpression} that evaluates to an array of matched substrings.
 */
export declare function regexFindAll(fieldName: string, pattern: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that evaluates to a list of all substrings in a string field that
 * match a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract all matches from 'content' based on a pattern stored in another field
 * regexFindAll("content", field("pattern"));
 * ```
 *
 * @param fieldName - The name of the field containing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#FunctionExpression} that evaluates to an array of matched substrings.
 */
export declare function regexFindAll(fieldName: string, pattern: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that evaluates to a list of all substrings in a string expression
 * that match a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract all mentions from a lower-cased comment
 * regexFindAll(field("comment"), "@[A-Za-z0-9_]+");
 * ```
 *
 * @param stringExpression - The expression representing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#FunctionExpression} that evaluates to an array of matched substrings.
 */
export declare function regexFindAll(stringExpression: Expression, pattern: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that evaluates to a list of all substrings in a string expression
 * that match a specified regular expression.
 *
 * This expression uses the {@link https://github.com/google/re2/wiki/Syntax | RE2} regular expression syntax.
 *
 * @example
 * ```typescript
 * // Extract all matches based on a dynamic pattern expression
 * regexFindAll(field("comment"), field("pattern"));
 * ```
 *
 * @param stringExpression - The expression representing the string to search.
 * @param pattern - The regular expression to search for.
 * @returns A new {@link @firebase/firestore/pipelines#FunctionExpression} that evaluates to an array of matched substrings.
 */
export declare function regexFindAll(stringExpression: Expression, pattern: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field matches a specified regular expression.
 *
 * @example
 * ```typescript
 * // Check if the 'email' field matches a valid email pattern
 * regexMatch("email", "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The regular expression to use for the match.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression match.
 */
export declare function regexMatch(fieldName: string, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field matches a specified regular expression.
 *
 * @example
 * ```typescript
 * // Check if the 'email' field matches a valid email pattern
 * regexMatch("email", field("pattern"));
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param pattern - The regular expression to use for the match.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression match.
 */
export declare function regexMatch(fieldName: string, pattern: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression matches a specified regular
 * expression.
 *
 * @example
 * ```typescript
 * // Check if the 'email' field matches a valid email pattern
 * regexMatch(field("email"), "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
 * ```
 *
 * @param stringExpression - The expression representing the string to match against.
 * @param pattern - The regular expression to use for the match.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression match.
 */
export declare function regexMatch(stringExpression: Expression, pattern: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression matches a specified regular
 * expression.
 *
 * @example
 * ```typescript
 * // Check if the 'email' field matches a valid email pattern
 * regexMatch(field("email"), field("pattern"));
 * ```
 *
 * @param stringExpression - The expression representing the string to match against.
 * @param pattern - The regular expression to use for the match.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the regular expression match.
 */
export declare function regexMatch(stringExpression: Expression, pattern: Expression): BooleanExpression;
/**
 * @beta
 * Options defining how a RemoveFieldsStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(removeFields:1)}.
 */
export declare type RemoveFieldsStageOptions = StageOptions & {
    /**
     * @beta
     * The fields to remove from each document.
     */
    fields: Array<Field | string>;
};
/**
 * @beta
 * Options defining how a ReplaceWithStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(replaceWith:1)}.
 */
export declare type ReplaceWithStageOptions = StageOptions & {
    /**
     * @beta
     * The name of a field that contains a map or an {@link @firebase/firestore/pipelines#Expression} that
     * evaluates to a map.
     */
    map: Expression | string;
};
/* Excluded from this release type: ResourcePath */
/**
 * @beta
 *
 * Creates an expression that reverses a string.
 *
 * @example
 * ```typescript
 * // Reverse the value of the 'myString' field.
 * reverse(field("myString"));
 * ```
 *
 * @param stringExpression - An expression evaluating to a string value, which will be reversed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
 */
export declare function reverse(stringExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that reverses a string value in the specified field.
 *
 * @example
 * ```typescript
 * // Reverse the value of the 'myString' field.
 * reverse("myString");
 * ```
 *
 * @param field - The name of the field representing the string to reverse.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
 */
export declare function reverse(field: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that rounds a numeric value to the nearest whole number.
 *
 * @example
 * ```typescript
 * // Round the value of the 'price' field.
 * round("price");
 * ```
 *
 * @param fieldName - The name of the field to round.
 * @returns A new `Expression` representing the rounded value.
 */
export declare function round(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that rounds a numeric value to the nearest whole number.
 *
 * @example
 * ```typescript
 * // Round the value of the 'price' field.
 * round(field("price"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which will be rounded.
 * @returns A new `Expression` representing the rounded value.
 */
export declare function round(expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that rounds a numeric value to the specified number of decimal places.
 *
 * @example
 * ```typescript
 * // Round the value of the 'price' field to two decimal places.
 * round("price", 2);
 * ```
 *
 * @param fieldName - The name of the field to round.
 * @param decimalPlaces - A constant or expression specifying the rounding precision in decimal places.
 * @returns A new `Expression` representing the rounded value.
 */
export declare function round(fieldName: string, decimalPlaces: number | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that rounds a numeric value to the specified number of decimal places.
 *
 * @example
 * ```typescript
 * // Round the value of the 'price' field to two decimal places.
 * round(field("price"), constant(2));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which will be rounded.
 * @param decimalPlaces - A constant or expression specifying the rounding precision in decimal places.
 * @returns A new `Expression` representing the rounded value.
 */
export declare function round(expression: Expression, decimalPlaces: number | Expression): FunctionExpression;
/**
 * @beta
 * Trims whitespace or a specified set of characters/bytes from the end of a string or byte array.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the end of the 'userInput' field
 * rtrim(field("userInput"));
 *
 * // Trim quotes from the end of the 'userInput' field
 * rtrim(field("userInput"), '"');
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
 * If not specified, whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string or byte array.
 */
export declare function rtrim(fieldName: string, valueToTrim?: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Trims whitespace or a specified set of characters/bytes from the end of a string or byte array.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the end of the 'userInput' field
 * rtrim(field("userInput"));
 *
 * // Trim quotes from the end of the 'userInput' field
 * rtrim(field("userInput"), '"');
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param valueToTrim - Optional. A string or byte array containing the characters/bytes to trim.
 * If not specified, whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string or byte array.
 */
export declare function rtrim(expression: Expression, valueToTrim?: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Defines the options for evaluating a sample stage within a pipeline.
 * This type combines common {@link @firebase/firestore/pipelines#StageOptions} with a specific configuration
 * where only one of the defined sampling methods can be applied.
 *
 * See {@link @firebase/firestore/pipelines#Pipeline.(sample:1)} to create a sample stage..
 */
export declare type SampleStageOptions = StageOptions & OneOf<{
    /**
     * @beta
     * If set, specifies the sample rate as a percentage of the
     * input documents.
     *
     * Cannot be set when `documents: number` is set.
     */
    percentage: number;
    /**
     * @beta
     * If set, specifies the sample rate as a total number of
     * documents to sample from the input documents.
     *
     * Cannot be set when `percentage: number` is set.
     */
    documents: number;
}>;
/**
 * @beta
 *
 * An interface that represents a selectable expression.
 */
export declare interface Selectable {
    selectable: true;
}
/**
 * @beta
 * Options defining how a SelectStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(select:1)}.
 */
export declare type SelectStageOptions = StageOptions & {
    /**
     * @beta
     * The fields to include in the output documents, specified as {@link @firebase/firestore/pipelines#Selectable} expression
     * or as a string value indicating the field name.
     */
    selections: Array<Selectable | string>;
};
/**
 * @beta
 * @beta
 * Options defining how a SortStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(sort:1)}.
 */
export declare type SortStageOptions = StageOptions & {
    /**
     * @beta
     * Orderings specify how the input documents are sorted.
     * One or more ordering are required.
     */
    orderings: Ordering[];
};
/**
 * @beta
 * Creates an expression that splits the value of a field on the provided delimiter.
 *
 * @example
 * ```typescript
 * // Split the 'scoresCsv' field on delimiter ','
 * split('scoresCsv', ',')
 * ```
 *
 * @param fieldName - Split the value in this field.
 * @param delimiter - Split on this delimiter.
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
 */
export declare function split(fieldName: string, delimiter: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that splits the value of a field on the provided delimiter.
 *
 * @example
 * ```typescript
 * // Split the 'scores' field on delimiter ',' or ':' depending on the stored format
 * split('scores', conditional(field('format').equal('csv'), constant(','), constant(':'))
 * ```
 *
 * @param fieldName - Split the value in this field.
 * @param delimiter - Split on this delimiter returned by evaluating this expression.
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
 */
export declare function split(fieldName: string, delimiter: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that splits a string into an array of substrings based on the provided delimiter.
 *
 * @example
 * ```typescript
 * // Split the 'scoresCsv' field on delimiter ','
 * split(field('scoresCsv'), ',')
 * ```
 *
 * @param expression - Split the result of this expression.
 * @param delimiter - Split on this delimiter.
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
 */
export declare function split(expression: Expression, delimiter: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that splits a string into an array of substrings based on the provided delimiter.
 *
 * @example
 * ```typescript
 * // Split the 'scores' field on delimiter ',' or ':' depending on the stored format
 * split(field('scores'), conditional(field('format').equal('csv'), constant(','), constant(':'))
 * ```
 *
 * @param expression - Split the result of this expression.
 * @param delimiter - Split on this delimiter returned by evaluating this expression.
 *
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the split function.
 */
export declare function split(expression: Expression, delimiter: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the square root of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the square root of the 'value' field.
 * sqrt(field("value"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which the square root will be computed for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the square root of the numeric value.
 */
export declare function sqrt(expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that computes the square root of a numeric value.
 *
 * @example
 * ```typescript
 * // Compute the square root of the 'value' field.
 * sqrt("value");
 * ```
 *
 * @param fieldName - The name of the field to compute the square root of.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the square root of the numeric value.
 */
export declare function sqrt(fieldName: string): FunctionExpression;
/**
 * @beta
 * Options defining how a Stage is evaluated.
 */
export declare interface StageOptions {
    /**
     * @beta
     * An escape hatch to set options not known at SDK build time. These values
     * will be passed directly to the Firestore backend and not used by the SDK.
     *
     * The option name will be used as provided. And must match the name
     * format used by the backend (hint: use a snake_case_name).
     *
     * Raw option values can be any type supported
     * by Firestore (for example: string, boolean, number, map, …). Value types
     * not known to the SDK will be rejected.
     *
     * Values specified in rawOptions will take precedence over any options
     * with the same name set by the SDK.
     *
     * `rawOptions` supports dot notation, if you want to override
     * a nested option.
     */
    rawOptions?: {
        [name: string]: unknown;
    };
}
/**
 * @beta
 *
 * Creates an expression that checks if a field's value starts with a given prefix.
 *
 * @example
 * ```typescript
 * // Check if the 'name' field starts with "Mr."
 * startsWith("name", "Mr.");
 * ```
 *
 * @param fieldName - The field name to check.
 * @param prefix - The prefix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'starts with' comparison.
 */
export declare function startsWith(fieldName: string, prefix: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a field's value starts with a given prefix.
 *
 * @example
 * ```typescript
 * // Check if the 'fullName' field starts with the value of the 'firstName' field
 * startsWith("fullName", field("firstName"));
 * ```
 *
 * @param fieldName - The field name to check.
 * @param prefix - The expression representing the prefix.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'starts with' comparison.
 */
export declare function startsWith(fieldName: string, prefix: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression starts with a given prefix.
 *
 * @example
 * ```typescript
 * // Check if the result of concatenating 'firstName' and 'lastName' fields starts with "Mr."
 * startsWith(field("fullName"), "Mr.");
 * ```
 *
 * @param stringExpression - The expression to check.
 * @param prefix - The prefix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'starts with' comparison.
 */
export declare function startsWith(stringExpression: Expression, prefix: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression starts with a given prefix.
 *
 * @example
 * ```typescript
 * // Check if the result of concatenating 'firstName' and 'lastName' fields starts with "Mr."
 * startsWith(field("fullName"), field("prefix"));
 * ```
 *
 * @param stringExpression - The expression to check.
 * @param prefix - The prefix to check for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'starts with' comparison.
 */
export declare function startsWith(stringExpression: Expression, prefix: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that concatenates string functions, fields or constants together.
 *
 * @example
 * ```typescript
 * // Combine the 'firstName', " ", and 'lastName' fields into a single string
 * stringConcat("firstName", " ", field("lastName"));
 * ```
 *
 * @param fieldName - The field name containing the initial string value.
 * @param secondString - An expression or string literal to concatenate.
 * @param otherStrings - Optional additional expressions or literals (typically strings) to concatenate.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the concatenated string.
 */
export declare function stringConcat(fieldName: string, secondString: Expression | string, ...otherStrings: Array<Expression | string>): FunctionExpression;
/**
 * @beta
 * Creates an expression that concatenates string expressions together.
 *
 * @example
 * ```typescript
 * // Combine the 'firstName', " ", and 'lastName' fields into a single string
 * stringConcat(field("firstName"), " ", field("lastName"));
 * ```
 *
 * @param firstString - The initial string expression to concatenate to.
 * @param secondString - An expression or string literal to concatenate.
 * @param otherStrings - Optional additional expressions or literals (typically strings) to concatenate.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the concatenated string.
 */
export declare function stringConcat(firstString: Expression, secondString: Expression | string, ...otherStrings: Array<Expression | string>): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field contains a specified substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example".
 * stringContains("description", "example");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param substring - The substring to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function stringContains(fieldName: string, substring: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string field contains a substring specified by an expression.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains the value of the 'keyword' field.
 * stringContains("description", field("keyword"));
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @param substring - The expression representing the substring to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function stringContains(fieldName: string, substring: Expression): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression contains a specified substring.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains "example".
 * stringContains(field("description"), "example");
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param substring - The substring to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function stringContains(stringExpression: Expression, substring: string): BooleanExpression;
/**
 * @beta
 *
 * Creates an expression that checks if a string expression contains a substring specified by another expression.
 *
 * @example
 * ```typescript
 * // Check if the 'description' field contains the value of the 'keyword' field.
 * stringContains(field("description"), field("keyword"));
 * ```
 *
 * @param stringExpression - The expression representing the string to perform the comparison on.
 * @param substring - The expression representing the substring to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the 'contains' comparison.
 */
export declare function stringContains(stringExpression: Expression, substring: Expression): BooleanExpression;
/**
 * @beta
 * Creates an expression that finds the index of the first occurrence of a substring or byte sequence.
 *
 * @example
 * ```typescript
 * // Find the index of "foo" in the 'text' field
 * stringIndexOf("text", "foo");
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param search - The substring or byte sequence to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the index of the first occurrence.
 */
export declare function stringIndexOf(fieldName: string, search: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that finds the index of the first occurrence of a substring or byte sequence.
 *
 * @example
 * ```typescript
 * // Find the index of "foo" in the 'text' field
 * stringIndexOf(field("text"), "foo");
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param search - The substring or byte sequence to search for.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the index of the first occurrence.
 */
export declare function stringIndexOf(expression: Expression, search: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that repeats a string or byte array a specified number of times.
 *
 * @example
 * ```typescript
 * // Repeat the 'label' field 3 times
 * stringRepeat("label", 3);
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param repetitions - The number of times to repeat the string or byte array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the repeated string or byte array.
 */
export declare function stringRepeat(fieldName: string, repetitions: number | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that repeats a string or byte array a specified number of times.
 *
 * @example
 * ```typescript
 * // Repeat the 'label' field 3 times
 * stringRepeat(field("label"), 3);
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param repetitions - The number of times to repeat the string or byte array.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the repeated string or byte array.
 */
export declare function stringRepeat(expression: Expression, repetitions: number | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that replaces all occurrences of a substring or byte sequence with a replacement.
 *
 * @example
 * ```typescript
 * // Replace all occurrences of "foo" with "bar" in the 'text' field
 * stringReplaceAll("text", "foo", "bar");
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param find - The substring or byte sequence to search for.
 * @param replacement - The replacement string or byte sequence.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the string or byte array with replacements.
 */
export declare function stringReplaceAll(fieldName: string, find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that replaces all occurrences of a substring or byte sequence with a replacement.
 *
 * @example
 * ```typescript
 * // Replace all occurrences of "foo" with "bar" in the 'text' field
 * stringReplaceAll(field("text"), "foo", "bar");
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param find - The substring or byte sequence to search for.
 * @param replacement - The replacement string or byte sequence.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the string or byte array with replacements.
 */
export declare function stringReplaceAll(expression: Expression, find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that replaces the first occurrence of a substring or byte sequence with a replacement.
 *
 * @example
 * ```typescript
 * // Replace the first occurrence of "foo" with "bar" in the 'text' field
 * stringReplaceOne("text", "foo", "bar");
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param find - The substring or byte sequence to search for.
 * @param replacement - The replacement string or byte sequence.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the string or byte array with the replacement.
 */
export declare function stringReplaceOne(fieldName: string, find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that replaces the first occurrence of a substring or byte sequence with a replacement.
 *
 * @example
 * ```typescript
 * // Replace the first occurrence of "foo" with "bar" in the 'text' field
 * stringReplaceOne(field("text"), "foo", "bar");
 * ```
 *
 * @param expression - The expression representing the string or byte array.
 * @param find - The substring or byte sequence to search for.
 * @param replacement - The replacement string or byte sequence.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the string or byte array with the replacement.
 */
export declare function stringReplaceOne(expression: Expression, find: string | Expression | Bytes, replacement: string | Expression | Bytes): FunctionExpression;
/**
 * @beta
 * Creates an expression that reverses a string.
 *
 * @example
 * ```typescript
 * // Reverse the value of the 'myString' field.
 * strReverse(field("myString"));
 * ```
 *
 * @param stringExpression - An expression evaluating to a string value, which will be reversed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
 */
export declare function stringReverse(stringExpression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that reverses a string value in the specified field.
 *
 * @example
 * ```typescript
 * // Reverse the value of the 'myString' field.
 * strReverse("myString");
 * ```
 *
 * @param field - The name of the field representing the string to reverse.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the reversed string.
 */
export declare function stringReverse(field: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns a substring of a string or byte array.
 *
 * @param field - The name of a field containing a string or byte array to compute the substring from.
 * @param position - Index of the first character of the substring.
 * @param length - Length of the substring.
 */
export declare function substring(field: string, position: number, length?: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns a substring of a string or byte array.
 *
 * @param input - An expression returning a string or byte array to compute the substring from.
 * @param position - Index of the first character of the substring.
 * @param length - Length of the substring.
 */
export declare function substring(input: Expression, position: number, length?: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns a substring of a string or byte array.
 *
 * @param field - The name of a field containing a string or byte array to compute the substring from.
 * @param position - An expression that returns the index of the first character of the substring.
 * @param length - An expression that returns the length of the substring.
 */
export declare function substring(field: string, position: Expression, length?: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that returns a substring of a string or byte array.
 *
 * @param input - An expression returning a string or byte array to compute the substring from.
 * @param position - An expression that returns the index of the first character of the substring.
 * @param length - An expression that returns the length of the substring.
 */
export declare function substring(input: Expression, position: Expression, length?: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts two expressions.
 *
 * @example
 * ```typescript
 * // Subtract the 'discount' field from the 'price' field
 * subtract(field("price"), field("discount"));
 * ```
 *
 * @param left - The expression to subtract from.
 * @param right - The expression to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the subtraction operation.
 */
export declare function subtract(left: Expression, right: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts a constant value from an expression.
 *
 * @example
 * ```typescript
 * // Subtract the constant value 2 from the 'value' field
 * subtract(field("value"), 2);
 * ```
 *
 * @param expression - The expression to subtract from.
 * @param value - The constant value to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the subtraction operation.
 */
export declare function subtract(expression: Expression, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts an expression from a field's value.
 *
 * @example
 * ```typescript
 * // Subtract the 'discount' field from the 'price' field
 * subtract("price", field("discount"));
 * ```
 *
 * @param fieldName - The field name to subtract from.
 * @param expression - The expression to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the subtraction operation.
 */
export declare function subtract(fieldName: string, expression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts a constant value from a field's value.
 *
 * @example
 * ```typescript
 * // Subtract 20 from the value of the 'total' field
 * subtract("total", 20);
 * ```
 *
 * @param fieldName - The field name to subtract from.
 * @param value - The constant value to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the subtraction operation.
 */
export declare function subtract(fieldName: string, value: unknown): FunctionExpression;
/**
 * @beta
 *
 * Creates an aggregation that calculates the sum of values from an expression across multiple
 * stage inputs.
 *
 * @example
 * ```typescript
 * // Calculate the total revenue from a set of orders
 * sum(field("orderAmount")).as("totalRevenue");
 * ```
 *
 * @param expression - The expression to sum up.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'sum' aggregation.
 */
export declare function sum(expression: Expression): AggregateFunction;
/**
 * @beta
 *
 * Creates an aggregation that calculates the sum of a field's values across multiple stage
 * inputs.
 *
 * @example
 * ```typescript
 * // Calculate the total revenue from a set of orders
 * sum("orderAmount").as("totalRevenue");
 * ```
 *
 * @param fieldName - The name of the field containing numeric values to sum up.
 * @returns A new {@link @firebase/firestore/pipelines#AggregateFunction} representing the 'sum' aggregation.
 */
export declare function sum(fieldName: string): AggregateFunction;
/**
 * @beta
 * Specify time granularity for expressions.
 */
export declare type TimeGranularity = 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'week(monday)' | 'week(tuesday)' | 'week(wednesday)' | 'week(thursday)' | 'week(friday)' | 'week(saturday)' | 'week(sunday)' | 'isoWeek' | 'month' | 'quarter' | 'year' | 'isoYear';
/**
 * @beta
 *
 * Creates an expression that adds a specified amount of time to a timestamp.
 *
 * @example
 * ```typescript
 * // Add some duration determined by field 'unit' and 'amount' to the 'timestamp' field.
 * timestampAdd(field("timestamp"), field("unit"), field("amount"));
 * ```
 *
 * @param timestamp - The expression representing the timestamp.
 * @param unit - The expression evaluates to unit of time, must be one of 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day'.
 * @param amount - The expression evaluates to amount of the unit.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampAdd(timestamp: Expression, unit: Expression, amount: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that adds a specified amount of time to a timestamp.
 *
 * @example
 * ```typescript
 * // Add 1 day to the 'timestamp' field.
 * timestampAdd(field("timestamp"), "day", 1);
 * ```
 *
 * @param timestamp - The expression representing the timestamp.
 * @param unit - The unit of time to add (e.g., "day", "hour").
 * @param amount - The amount of time to add.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampAdd(timestamp: Expression, unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that adds a specified amount of time to a timestamp represented by a field.
 *
 * @example
 * ```typescript
 * // Add 1 day to the 'timestamp' field.
 * timestampAdd("timestamp", "day", 1);
 * ```
 *
 * @param fieldName - The name of the field representing the timestamp.
 * @param unit - The unit of time to add (e.g., "day", "hour").
 * @param amount - The amount of time to add.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampAdd(fieldName: string, unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts a specified amount of time from a timestamp.
 *
 * @example
 * ```typescript
 * // Subtract some duration determined by field 'unit' and 'amount' from the 'timestamp' field.
 * timestampSubtract(field("timestamp"), field("unit"), field("amount"));
 * ```
 *
 * @param timestamp - The expression representing the timestamp.
 * @param unit - The expression evaluates to unit of time, must be one of 'microsecond', 'millisecond', 'second', 'minute', 'hour', 'day'.
 * @param amount - The expression evaluates to amount of the unit.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampSubtract(timestamp: Expression, unit: Expression, amount: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts a specified amount of time from a timestamp.
 *
 * @example
 * ```typescript
 * // Subtract 1 day from the 'timestamp' field.
 * timestampSubtract(field("timestamp"), "day", 1);
 * ```
 *
 * @param timestamp - The expression representing the timestamp.
 * @param unit - The unit of time to subtract (e.g., "day", "hour").
 * @param amount - The amount of time to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampSubtract(timestamp: Expression, unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that subtracts a specified amount of time from a timestamp represented by a field.
 *
 * @example
 * ```typescript
 * // Subtract 1 day from the 'timestamp' field.
 * timestampSubtract("timestamp", "day", 1);
 * ```
 *
 * @param fieldName - The name of the field representing the timestamp.
 * @param unit - The unit of time to subtract (e.g., "day", "hour").
 * @param amount - The amount of time to subtract.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the resulting timestamp.
 */
export declare function timestampSubtract(fieldName: string, unit: 'microsecond' | 'millisecond' | 'second' | 'minute' | 'hour' | 'day', amount: number): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp expression to the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to microseconds since epoch.
 * timestampToUnixMicros(field("timestamp"));
 * ```
 *
 * @param expr - The expression representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of microseconds since epoch.
 */
export declare function timestampToUnixMicros(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp field to the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to microseconds since epoch.
 * timestampToUnixMicros("timestamp");
 * ```
 *
 * @param fieldName - The name of the field representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of microseconds since epoch.
 */
export declare function timestampToUnixMicros(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp expression to the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to milliseconds since epoch.
 * timestampToUnixMillis(field("timestamp"));
 * ```
 *
 * @param expr - The expression representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of milliseconds since epoch.
 */
export declare function timestampToUnixMillis(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp field to the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to milliseconds since epoch.
 * timestampToUnixMillis("timestamp");
 * ```
 *
 * @param fieldName - The name of the field representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of milliseconds since epoch.
 */
export declare function timestampToUnixMillis(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp expression to the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to seconds since epoch.
 * timestampToUnixSeconds(field("timestamp"));
 * ```
 *
 * @param expr - The expression representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of seconds since epoch.
 */
export declare function timestampToUnixSeconds(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a timestamp field to the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC).
 *
 * @example
 * ```typescript
 * // Convert the 'timestamp' field to seconds since epoch.
 * timestampToUnixSeconds("timestamp");
 * ```
 *
 * @param fieldName - The name of the field representing the timestamp.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the number of seconds since epoch.
 */
export declare function timestampToUnixSeconds(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a timestamp to a specified granularity.
 *
 * @example
 * ```typescript
 * // Truncate the 'createdAt' timestamp to the beginning of the day.
 * field('createdAt').timestampTruncate('day')
 * ```
 *
 * @param fieldName - Truncate the timestamp value contained in this field.
 * @param granularity - The granularity to truncate to.
 * @param timezone - The timezone to use for truncation. Valid values are from
 * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
 * @returns A new `Expression` representing the truncated timestamp.
 */
export declare function timestampTruncate(fieldName: string, granularity: TimeGranularity, timezone?: string | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a timestamp to a specified granularity.
 *
 * @example
 * ```typescript
 * // Truncate the 'createdAt' timestamp to the granularity specified in the field 'granularity'.
 * field('createdAt').timestampTruncate(field('granularity'))
 * ```
 *
 * @param fieldName - Truncate the timestamp value contained in this field.
 * @param granularity - The granularity to truncate to.
 * @param timezone - The timezone to use for truncation. Valid values are from
 * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
 * @returns A new `Expression` representing the truncated timestamp.
 */
export declare function timestampTruncate(fieldName: string, granularity: Expression, timezone?: string | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a timestamp to a specified granularity.
 *
 * @example
 * ```typescript
 * // Truncate the 'createdAt' timestamp to the beginning of the day.
 * field('createdAt').timestampTruncate('day')
 * ```
 *
 * @param timestampExpression - Truncate the timestamp value that is returned by this expression.
 * @param granularity - The granularity to truncate to.
 * @param timezone - The timezone to use for truncation. Valid values are from
 * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
 * @returns A new `Expression` representing the truncated timestamp.
 */
export declare function timestampTruncate(timestampExpression: Expression, granularity: TimeGranularity, timezone?: string | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a timestamp to a specified granularity.
 *
 * @example
 * ```typescript
 * // Truncate the 'createdAt' timestamp to the granularity specified in the field 'granularity'.
 * field('createdAt').timestampTruncate(field('granularity'))
 * ```
 *
 * @param timestampExpression - Truncate the timestamp value that is returned by this expression.
 * @param granularity - The granularity to truncate to.
 * @param timezone - The timezone to use for truncation. Valid values are from
 * the TZ database (e.g., "America/Los_Angeles") or in the format "Etc/GMT-1".
 * @returns A new `Expression` representing the truncated timestamp.
 */
export declare function timestampTruncate(timestampExpression: Expression, granularity: Expression, timezone?: string | Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a string field to lowercase.
 *
 * @example
 * ```typescript
 * // Convert the 'name' field to lowercase
 * toLower("name");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the lowercase string.
 */
export declare function toLower(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a string expression to lowercase.
 *
 * @example
 * ```typescript
 * // Convert the 'name' field to lowercase
 * toLower(field("name"));
 * ```
 *
 * @param stringExpression - The expression representing the string to convert to lowercase.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the lowercase string.
 */
export declare function toLower(stringExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a string field to uppercase.
 *
 * @example
 * ```typescript
 * // Convert the 'title' field to uppercase
 * toUpper("title");
 * ```
 *
 * @param fieldName - The name of the field containing the string.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the uppercase string.
 */
export declare function toUpper(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that converts a string expression to uppercase.
 *
 * @example
 * ```typescript
 * // Convert the 'title' field to uppercase
 * toUppercase(field("title"));
 * ```
 *
 * @param stringExpression - The expression representing the string to convert to uppercase.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the uppercase string.
 */
export declare function toUpper(stringExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes leading and trailing whitespace from a string or byte array.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the 'userInput' field
 * trim("userInput");
 *
 * // Trim quotes from the 'userInput' field
 * trim("userInput", '"');
 * ```
 *
 * @param fieldName - The name of the field containing the string or byte array.
 * @param valueToTrim - Optional This parameter is treated as a set of characters or bytes that will be
 * trimmed from the input. If not specified, then whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string.
 */
export declare function trim(fieldName: string, valueToTrim?: string | Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that removes leading and trailing characters from a string or byte array expression.
 *
 * @example
 * ```typescript
 * // Trim whitespace from the 'userInput' field
 * trim(field("userInput"));
 *
 * // Trim quotes from the 'userInput' field
 * trim(field("userInput"), '"');
 * ```
 *
 * @param stringExpression - The expression representing the string or byte array to trim.
 * @param valueToTrim - Optional This parameter is treated as a set of characters or bytes that will be
 * trimmed from the input. If not specified, then whitespace will be trimmed.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the trimmed string or byte array.
 */
export declare function trim(stringExpression: Expression, valueToTrim?: string | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates the numeric value of a field to an integer.
 *
 * @example
 * ```typescript
 * // Truncate the value of the 'rating' field
 * trunc("rating");
 * ```
 *
 * @param fieldName - The name of the field containing the number to truncate.
 * @returns A new `Expression` representing the truncated value.
 */
export declare function trunc(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates the numeric value of an expression to an integer.
 *
 * @example
 * ```typescript
 * // Truncate the value of the 'rating' field.
 * trunc(field("rating"));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which will be truncated.
 * @returns A new `Expression` representing the truncated value.
 */
export declare function trunc(expression: Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a numeric expression to the specified number of decimal places.
 *
 * @example
 * ```typescript
 * // Truncate the value of the 'rating' field to two decimal places.
 * trunc("rating", 2);
 * ```
 *
 * @param fieldName - The name of the field to truncate.
 * @param decimalPlaces - A constant or expression specifying the truncation precision in decimal places.
 * @returns A new `Expression` representing the truncated value.
 */
export declare function trunc(fieldName: string, decimalPlaces: number | Expression): FunctionExpression;
/**
 * @beta
 * Creates an expression that truncates a numeric value to the specified number of decimal places.
 *
 * @example
 * ```typescript
 * // Truncate the value of the 'rating' field to two decimal places.
 * trunc(field("rating"), constant(2));
 * ```
 *
 * @param expression - An expression evaluating to a numeric value, which will be truncated.
 * @param decimalPlaces - A constant or expression specifying the truncation precision in decimal places.
 * @returns A new `Expression` representing the truncated value.
 */
export declare function trunc(expression: Expression, decimalPlaces: number | Expression): FunctionExpression;
/* Excluded from this release type: TSType */
/**
 * @beta
 *
 * An enumeration of the different types generated by the Firestore backend.
 *
 * <ul>
 *  <li>Numerics evaluate directly to backend representation (`int64` or `float64`), not JS `number`.</li>
 *  <li>JavaScript `Date` and firestore `Timestamp` objects strictly evaluate to `'timestamp'`.</li>
 *  <li>Advanced configurations parsing backend types (such as `decimal128`, `max_key` or `min_key` from BSON) are also incorporated in this union string type. Note that `decimal128` is a backend-only numeric type that the JavaScript SDK cannot create natively, but can be evaluated in pipelines.</li>
 * </ul>
 */
export declare type Type = 'null' | 'array' | 'boolean' | 'bytes' | 'timestamp' | 'geo_point' | 'number' | 'int32' | 'int64' | 'float64' | 'decimal128' | 'map' | 'reference' | 'string' | 'vector' | 'max_key' | 'min_key' | 'object_id' | 'regex' | 'request_timestamp';
/**
 * @beta
 * Creates an expression that returns the data type of the data in the specified field.
 *
 * @remarks
 * String inputs passed iteratively to this global function act as `field()` path lookups.
 * If you wish to pass a string literal value, it must be wrapped: `type(constant("my_string"))`.
 *
 * @example
 * ```typescript
 * // Get the data type of the value in field 'title'
 * type('title')
 * ```
 *
 * @returns A new `Expression` representing the data type.
 */
export declare function type(fieldName: string): FunctionExpression;
/**
 * @beta
 * Creates an expression that returns the data type of an expression's result.
 *
 * @example
 * ```typescript
 * // Get the data type of a conditional expression
 * type(conditional(exists('foo'), constant(1), constant(true)))
 * ```
 *
 * @returns A new `Expression` representing the data type.
 */
export declare function type(expression: Expression): FunctionExpression;
/**
 * @beta
 * Options defining how a UnionStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(union:1)}.
 */
export declare type UnionStageOptions = StageOptions & {
    /**
     * @beta
     * Specifies the other Pipeline to union with.
     */
    other: Pipeline;
};
/**
 * @beta
 *
 * Creates an expression that interprets an expression as the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'microseconds' field as microseconds since epoch.
 * unixMicrosToTimestamp(field("microseconds"));
 * ```
 *
 * @param expr - The expression representing the number of microseconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixMicrosToTimestamp(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that interprets a field's value as the number of microseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'microseconds' field as microseconds since epoch.
 * unixMicrosToTimestamp("microseconds");
 * ```
 *
 * @param fieldName - The name of the field representing the number of microseconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixMicrosToTimestamp(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that interprets an expression as the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'milliseconds' field as milliseconds since epoch.
 * unixMillisToTimestamp(field("milliseconds"));
 * ```
 *
 * @param expr - The expression representing the number of milliseconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixMillisToTimestamp(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that interprets a field's value as the number of milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'milliseconds' field as milliseconds since epoch.
 * unixMillisToTimestamp("milliseconds");
 * ```
 *
 * @param fieldName - The name of the field representing the number of milliseconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixMillisToTimestamp(fieldName: string): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that interprets an expression as the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'seconds' field as seconds since epoch.
 * unixSecondsToTimestamp(field("seconds"));
 * ```
 *
 * @param expr - The expression representing the number of seconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixSecondsToTimestamp(expr: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that interprets a field's value as the number of seconds since the Unix epoch (1970-01-01 00:00:00 UTC)
 * and returns a timestamp.
 *
 * @example
 * ```typescript
 * // Interpret the 'seconds' field as seconds since epoch.
 * unixSecondsToTimestamp("seconds");
 * ```
 *
 * @param fieldName - The name of the field representing the number of seconds since epoch.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the timestamp.
 */
export declare function unixSecondsToTimestamp(fieldName: string): FunctionExpression;
/**
 * @beta
 * Represents the specific options available for configuring an `UnnestStage` within a pipeline.
 */
export declare type UnnestStageOptions = StageOptions & {
    /**
     * @beta
     * A `Selectable` object that defines an array expression to be un-nested
     * and the alias for the un-nested field.
     */
    selectable: Selectable;
    /**
     * @beta
     * If set, specifies the field on the output documents that will contain the
     * offset (starting at zero) that the element is from the original array.
     */
    indexField?: string;
};
/**
 * @beta
 *
 * Creates an expression that calculates the length of a Firestore Vector.
 *
 * @example
 * ```typescript
 * // Get the vector length (dimension) of the field 'embedding'.
 * vectorLength(field("embedding"));
 * ```
 *
 * @param vectorExpression - The expression representing the Firestore Vector.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the array.
 */
export declare function vectorLength(vectorExpression: Expression): FunctionExpression;
/**
 * @beta
 *
 * Creates an expression that calculates the length of a Firestore Vector represented by a field.
 *
 * @example
 * ```typescript
 * // Get the vector length (dimension) of the field 'embedding'.
 * vectorLength("embedding");
 * ```
 *
 * @param fieldName - The name of the field representing the Firestore Vector.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the length of the array.
 */
export declare function vectorLength(fieldName: string): FunctionExpression;
/**
 * @beta
 * Options defining how a WhereStage is evaluated. See {@link @firebase/firestore/pipelines#Pipeline.(where:1)}.
 */
export declare type WhereStageOptions = StageOptions & {
    /**
     * @beta
     * The {@link @firebase/firestore/pipelines#BooleanExpression} to apply as a filter for each input document to this stage.
     */
    condition: BooleanExpression;
};
/**
 * @beta
 *
 * Creates an expression that performs a logical 'XOR' (exclusive OR) operation on multiple BooleanExpressions.
 *
 * @example
 * ```typescript
 * // Check if only one of the conditions is true: 'age' greater than 18, 'city' is "London",
 * // or 'status' is "active".
 * const condition = xor(
 *     greaterThan("age", 18),
 *     equal("city", "London"),
 *     equal("status", "active"));
 * ```
 *
 * @param first - The first condition.
 * @param second - The second condition.
 * @param additionalConditions - Additional conditions to 'XOR' together.
 * @returns A new {@link @firebase/firestore/pipelines#Expression} representing the logical 'XOR' operation.
 */
export declare function xor(first: BooleanExpression, second: BooleanExpression, ...additionalConditions: BooleanExpression[]): BooleanExpression;
export {};
