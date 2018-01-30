/**
 * @flow
 * FieldValue representation wrapper
 */
export default class FieldValue {
    static delete(): FieldValue;
    static serverTimestamp(): FieldValue;
}
export declare const DELETE_FIELD_VALUE: FieldValue;
export declare const SERVER_TIMESTAMP_FIELD_VALUE: FieldValue;
