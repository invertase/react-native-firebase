/**
 * @flow
 * GeoPoint representation wrapper
 */
/**
 * @class GeoPoint
 */
export default class GeoPoint {
    private _latitude;
    private _longitude;
    constructor(latitude: number, longitude: number);
    readonly latitude: number;
    readonly longitude: number;
}
