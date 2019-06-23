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

describe('firestore()', () => {

  describe.only('testing', () => {
    it('test', async () => {
      // await Utils.sleep(10000);
      try {
        const a = await firebase.firestore().collectionGroup('collectionGroup').get();
        console.log(a);
      } catch (e) {
        throw e;
      }
    })
  });

  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.firestore);
      app.firestore().app.should.equal(app);
    });

    // removing as pending if module.options.hasMultiAppSupport = true
    it('supports multiple apps', async () => {
      firebase.firestore().app.name.should.equal('[DEFAULT]');

      firebase
        .firestore(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase
        .app('secondaryFromNative')
        .firestore()
        .app.name.should.equal('secondaryFromNative');
    });
  });

  describe('batch()', () => {

  });

  describe('clearPersistence()', () => {

  });

  describe('collection()', () => {
    it('throws if path is not a string', () => {
      try {
        firebase.firestore().collection(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'collectionPath' must be a string value`);
        return Promise.resolve();
      }
    });

    it('throws if path is empty string', () => {
      try {
        firebase.firestore().collection('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'collectionPath' must be a non-empty string`);
        return Promise.resolve();
      }
    });

    it('throws if path does not point to a collection', () => {
      // try {
      //   firebase.firestore().collection('');
      //   return Promise.reject(new Error('Did not throw an Error.'));
      // } catch (error) {
      //   error.message.should.containEql(`'collectionPath' must be a non-empty string`);
      //   return Promise.resolve();
      // }
    });

    it('returns a new CollectionReference', () => {

    });
  });

});
