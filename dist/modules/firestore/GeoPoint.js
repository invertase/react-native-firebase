/**
 * 
 * GeoPoint representation wrapper
 */

/**
 * @class GeoPoint
 */
export default class GeoPoint {
  constructor(latitude, longitude) {
    // TODO: Validation
    // validate.isNumber('latitude', latitude);
    // validate.isNumber('longitude', longitude);
    this._latitude = latitude;
    this._longitude = longitude;
  }

  get latitude() {
    return this._latitude;
  }

  get longitude() {
    return this._longitude;
  }

}