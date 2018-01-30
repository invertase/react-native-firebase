/**
 * Deep get a value from an object.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
export declare function deepGet(object: object, path: string, joiner?: string): any;
/**
 * Deep check if a key exists.
 * @website https://github.com/Salakar/deeps
 * @param object
 * @param path
 * @param joiner
 * @returns {*}
 */
export declare function deepExists(object: Object, path: string, joiner?: string): boolean;
/**
 * Deep Check if obj1 keys are contained in obj2
 * @param obj1
 * @param obj2
 * @returns {boolean}
 */
export declare function areObjectKeysContainedInOther(obj1: Object, obj2: Object): boolean;
/**
 * Check if arr1 is contained in arr2
 * @param arr1
 * @param arr2
 * @returns {boolean}
 */
export declare function isArrayContainedInOther(arr1: any[], arr2: any[]): boolean;
/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
export declare function isObject(item: any): item is object;
/**
 * Simple is function check
 * @param item
 * @returns {*|boolean}
 */
export declare function isFunction(item?: any): item is Function;
/**
 * Simple is string check
 * @param value
 * @return {boolean}
 */
export declare function isString(value: any): value is string;
export declare const isIOS: boolean;
export declare const isAndroid: boolean;
/**
 *
 * @param string
 * @returns {*}
 */
export declare function tryJSONParse(string: string | null): any;
/**
 *
 * @param data
 * @returns {*}
 */
export declare function tryJSONStringify(data: any): string | null;
export declare const windowOrGlobal: any;
/**
 * No operation func
 */
export declare function noop(): void;
/**
 * Returns a string typeof that's valid for Firebase usage
 * @param value
 * @return {*}
 */
export declare function typeOf(value: any): string;
/**
 * Generate a firebase id - for use with ref().push(val, cb) - e.g. -KXMr7k2tXUFQqiaZRY4'
 * @param serverTimeOffset - pass in server time offset from native side
 * @returns {string}
 */
export declare function generatePushID(serverTimeOffset?: number): string;
export interface CustomError extends Error {
    code?: string;
}
/**
 * Converts a code and message from a native event to a JS Error
 * @param code
 * @param message
 * @param additionalProps
 * @returns {Error}
 */
export declare function nativeToJSError(code: string, message: string, additionalProps?: object): CustomError;
/**
 *
 * @param object
 * @return {string}
 */
export declare function objectToUniqueId(object: Object): string;
/**
 * Return the existing promise if no callback provided or
 * exec the promise and callback if optionalCallback is valid.
 *
 * @param promise
 * @param optionalCallback
 * @return {Promise}
 */
export declare function promiseOrCallback(promise: Promise<any>, optionalCallback?: Function): Promise<any>;
/**
 * Generate a firestore auto id for use with collection/document .add()
 * @return {string}
 */
export declare function firestoreAutoId(): string;
