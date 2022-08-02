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
const COLLECTION = 'firestore';
const { wipe } = require('./helpers');
describe('firestore.GeoPoint', function () {
  before(function () {
    return wipe();
  });
  it('throws if invalid number of arguments', function () {
    try {
      new firebase.firestore.GeoPoint(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('constructor expected latitude and longitude values');
      return Promise.resolve();
    }
  });

  it('throws if latitude is not a number', function () {
    try {
      new firebase.firestore.GeoPoint('123', 0);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'latitude' must be a number value");
      return Promise.resolve();
    }
  });

  it('throws if longitude is not a number', function () {
    try {
      new firebase.firestore.GeoPoint(0, '123');
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'longitude' must be a number value");
      return Promise.resolve();
    }
  });

  it('throws if latitude is not valid', function () {
    try {
      new firebase.firestore.GeoPoint(-100, 0);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'latitude' must be a number between -90 and 90");
      return Promise.resolve();
    }
  });

  it('throws if longitude is not valid', function () {
    try {
      new firebase.firestore.GeoPoint(0, 200);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'longitude' must be a number between -180 and 180");
      return Promise.resolve();
    }
  });

  it('gets the latitude value', function () {
    const geo = new firebase.firestore.GeoPoint(20, 0);
    geo.latitude.should.equal(20);
  });

  it('gets the longitude value', function () {
    const geo = new firebase.firestore.GeoPoint(20, 15);
    geo.longitude.should.equal(15);
  });

  describe('isEqual()', function () {
    it('throws if other is a GeoPoint instance', function () {
      try {
        const geo = new firebase.firestore.GeoPoint(0, 0);
        geo.isEqual();
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'other' expected an instance of GeoPoint");
        return Promise.resolve();
      }
    });

    it('returns false if not the same', function () {
      const geo1 = new firebase.firestore.GeoPoint(0, 0);
      const geo2 = new firebase.firestore.GeoPoint(0, 1);
      const equal = geo1.isEqual(geo2);
      equal.should.equal(false);
    });

    it('returns true if the same', function () {
      const geo1 = new firebase.firestore.GeoPoint(40, 40);
      const geo2 = new firebase.firestore.GeoPoint(40, 40);
      const equal = geo1.isEqual(geo2);
      equal.should.equal(true);
    });
  });

  describe('toJSON()', function () {
    it('returns a json representation of the GeoPoint', function () {
      const geo = new firebase.firestore.GeoPoint(30, 35);
      const json = geo.toJSON();
      json.latitude.should.eql(30);
      json.longitude.should.eql(35);
    });
  });

  it('sets & returns correctly', async function () {
    const ref = firebase.firestore().doc(`${COLLECTION}/geopoint`);
    await ref.set({
      geopoint: new firebase.firestore.GeoPoint(20, 30),
    });
    const snapshot = await ref.get();
    const geo = snapshot.data().geopoint;
    should.equal(geo.constructor.name, 'FirestoreGeoPoint');
    geo.latitude.should.equal(20);
    geo.longitude.should.equal(30);
    await ref.delete();
  });
});
