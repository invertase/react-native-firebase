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

const { wipe } = require('../helpers');

// Used to create a Blob
const blobObject = { hello: 'world' };
const blobString = JSON.stringify(blobObject);
const blobBuffer = Buffer.from(blobString);
const blobBase64 = blobBuffer.toString('base64');

describe('firestore().doc() -> snapshot.data()', () => {
  before(() => wipe());

  it('returns undefined if documet does not exist', async () => {
    const ref = firebase.firestore().doc('v6/idonotexist');
    const snapshot = await ref.get();
    should.equal(snapshot.data(), undefined);
  });

  it('returns an object if exists', async () => {
    const ref = firebase.firestore().doc('v6/getData');
    const data = { foo: 'bar' };
    await ref.set(data);
    const snapshot = await ref.get();
    snapshot.data().should.eql(jet.contextify(data));
    await ref.delete();
  });

  it('returns an object when document is empty', async () => {
    const ref = firebase.firestore().doc('v6/getData');
    const data = {};
    await ref.set(data);
    const snapshot = await ref.get();
    snapshot.data().should.eql(jet.contextify(data));
    await ref.delete();
  });

  xit('handles SnapshotOptions', () => {
    // TODO
  });

  it('handles all data types', async () => {
    const types = {
      string: '123456',
      stringEmpty: '',
      number: 123456,
      infinity: Infinity,
      minusInfinity: -Infinity,
      nan: 1 + undefined,
      boolTrue: true,
      boolFalse: false,
      map: {}, // set after
      array: [], // set after,
      nullValue: null,
      timestamp: new firebase.firestore.Timestamp(123, 123456),
      date: new Date(),
      geopoint: new firebase.firestore.GeoPoint(1, 2),
      reference: firebase.firestore().doc('v6/foobar'),
      blob: firebase.firestore.Blob.fromBase64String(blobBase64),
    };

    const map = { foo: 'bar' };
    const array = [123, '456', null];
    types.map = map;
    types.array = array;

    const ref = firebase.firestore().doc('v6/types');
    await ref.set(types);
    const snapshot = await ref.get();
    const data = snapshot.data();

    // String
    data.string.should.be.a.String();
    data.string.should.equal(types.string);
    data.stringEmpty.should.be.a.String();
    data.stringEmpty.should.equal(types.stringEmpty);

    // Number
    data.number.should.be.a.Number();
    data.number.should.equal(types.number);
    data.infinity.should.be.Infinity();
    should.equal(data.infinity, Number.POSITIVE_INFINITY);
    data.minusInfinity.should.be.Infinity();
    should.equal(data.minusInfinity, Number.NEGATIVE_INFINITY);
    data.nan.should.be.eql(NaN);

    // Boolean
    data.boolTrue.should.be.a.Boolean();
    data.boolTrue.should.be.true();
    data.boolFalse.should.be.a.Boolean();
    data.boolFalse.should.be.false();

    // Map
    data.map.should.be.an.Object();
    data.map.should.eql(jet.contextify(map));

    // Array
    data.array.should.be.an.Array();
    data.array.should.eql(jet.contextify(array));

    // Null
    should.equal(data.nullValue, null);

    // Timestamp
    data.timestamp.should.be.an.instanceOf(firebase.firestore.Timestamp);
    data.timestamp.seconds.should.be.a.Number();
    data.timestamp.nanoseconds.should.be.a.Number();
    data.date.should.be.an.instanceOf(firebase.firestore.Timestamp);
    data.date.seconds.should.be.a.Number();
    data.date.nanoseconds.should.be.a.Number();

    // GeoPoint
    data.geopoint.should.be.an.instanceOf(firebase.firestore.GeoPoint);
    data.geopoint.latitude.should.be.a.Number();
    data.geopoint.longitude.should.be.a.Number();

    // Reference
    // data.reference.should.be.an.instanceOf();
    data.reference.path.should.equal('v6/foobar');

    // Blob
    data.blob.toBase64.should.be.a.Function();

    await ref.delete();
  });
});
