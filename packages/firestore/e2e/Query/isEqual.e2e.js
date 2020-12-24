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

describe('firestore().collection().isEqual()', function () {
  it('throws if other is not a Query', function () {
    try {
      firebase.firestore().collection(COLLECTION).isEqual(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'other' expected a Query instance");
      return Promise.resolve();
    }
  });

  it('returns false when not equal (simple checks)', function () {
    const subCol = `${COLLECTION}/isequal/simplechecks`;
    const query = firebase.firestore().collection(subCol);

    const q1 = firebase.firestore(firebase.app('secondaryFromNative')).collection(subCol);
    const q2 = firebase.firestore().collection(subCol).where('foo', '==', 'bar');
    const q3 = firebase.firestore().collection(subCol).orderBy('foo');
    const q4 = firebase.firestore().collection(subCol).limit(3);

    const ref1 = firebase.firestore().collection(subCol).where('bar', '==', true);
    const ref2 = firebase.firestore().collection(subCol).where('bar', '==', true);

    const eql1 = query.isEqual(q1);
    const eql2 = query.isEqual(q2);
    const eql3 = query.isEqual(q3);
    const eql4 = query.isEqual(q4);
    const eql5 = ref1.isEqual(ref2);

    eql1.should.be.False();
    eql2.should.be.False();
    eql3.should.be.False();
    eql4.should.be.False();
    eql5.should.be.True();
  });

  it('returns false when not equal (expensive checks)', function () {
    const query = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('bam')
      .limit(1)
      .endAt(2);

    const q1 = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '<', 'bar')
      .orderBy('foo')
      .limit(1)
      .endAt(2);

    const q2 = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('foob')
      .limit(1)
      .endAt(2);

    const q3 = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('baz')
      .limit(2)
      .endAt(2);

    const q4 = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('baz')
      .limit(1)
      .endAt(1);

    const eql1 = query.isEqual(q1);
    const eql2 = query.isEqual(q2);
    const eql3 = query.isEqual(q3);
    const eql4 = query.isEqual(q4);

    eql1.should.be.False();
    eql2.should.be.False();
    eql3.should.be.False();
    eql4.should.be.False();
  });

  it('returns true when equal', function () {
    const query = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('baz')
      .limit(1)
      .endAt(2);

    const query2 = firebase
      .firestore()
      .collection(COLLECTION)
      .where('foo', '==', 'bar')
      .orderBy('baz')
      .limit(1)
      .endAt(2);

    const eql1 = query.isEqual(query2);

    eql1.should.be.True();
  });
});
