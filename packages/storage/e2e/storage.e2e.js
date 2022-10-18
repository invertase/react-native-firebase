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

const { PATH } = require('./helpers');

describe('storage()', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      should.exist(app.storage);
      app.storage().app.should.equal(app);
    });

    it('supports multiple apps', async function () {
      firebase.storage().app.name.should.equal('[DEFAULT]');

      firebase
        .storage(firebase.app('secondaryFromNative'))
        .app.name.should.equal('secondaryFromNative');

      firebase.app('secondaryFromNative').storage().app.name.should.equal('secondaryFromNative');
    });

    it('supports specifying a bucket', async function () {
      const bucket = 'gs://react-native-firebase-testing';
      const defaultInstance = firebase.storage();
      defaultInstance.app.name.should.equal('[DEFAULT]');
      should.equal(
        defaultInstance._customUrlOrRegion,
        'gs://react-native-firebase-testing.appspot.com',
      );
      firebase.storage().app.name.should.equal('[DEFAULT]');
      const instanceForBucket = firebase.app().storage(bucket);
      instanceForBucket._customUrlOrRegion.should.equal(bucket);
    });

    it('throws an error if an invalid bucket url is provided', async function () {
      const bucket = 'invalid://react-native-firebase-testing';
      try {
        firebase.app().storage(bucket);
        return Promise.reject(new Error('Did not throw.'));
      } catch (error) {
        error.message.should.containEql("bucket url must be a string and begin with 'gs://'");
        return Promise.resolve();
      }
    });

    // FIXME on android this is unathorized against emulator but works on iOS?
    xit('uploads to a custom bucket when specified', async function () {
      if (device.getPlatform() === 'ios') {
        const jsonDerulo = JSON.stringify({ foo: 'bar' });
        const bucket = 'gs://react-native-firebase-testing';

        const uploadTaskSnapshot = await firebase
          .app()
          .storage(bucket)
          .ref(`${PATH}/putStringCustomBucket.json`)
          .putString(jsonDerulo, firebase.storage.StringFormat.RAW, {
            contentType: 'application/json',
          });

        uploadTaskSnapshot.state.should.eql(firebase.storage.TaskState.SUCCESS);
        uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
        uploadTaskSnapshot.metadata.should.be.an.Object();
      } else {
        this.skip();
      }
    });
  });

  describe('ref', function () {
    it('uses default path if none provided', async function () {
      const ref = firebase.storage().ref();
      ref.fullPath.should.equal('/');
    });

    it('accepts a custom path', async function () {
      const ref = firebase.storage().ref('foo/bar/baz.png');
      ref.fullPath.should.equal('foo/bar/baz.png');
    });

    it('strips leading / from custom path', async function () {
      const ref = firebase.storage().ref('/foo/bar/baz.png');
      ref.fullPath.should.equal('foo/bar/baz.png');
    });

    it('throws an error if custom path not a string', async function () {
      try {
        firebase.storage().ref({ derp: true });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'path' must be a string value");
        return Promise.resolve();
      }
    });
  });

  describe('refFromURL', function () {
    it('accepts a gs url', async function () {
      const url = 'gs://foo/bar/baz.png';
      const ref = firebase.storage().refFromURL(url);
      ref.toString().should.equal(url);
    });

    it('accepts a https url', async function () {
      const url =
        'https://firebasestorage.googleapis.com/v0/b/react-native-firebase-testing.appspot.com/o/1mbTestFile.gif?alt=media';
      const ref = firebase.storage().refFromURL(url);
      ref.bucket.should.equal('react-native-firebase-testing.appspot.com');
      ref.name.should.equal('1mbTestFile.gif');
      ref.toString().should.equal('gs://react-native-firebase-testing.appspot.com/1mbTestFile.gif');
    });

    it('accepts a https encoded url', async function () {
      const url =
        'https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Freact-native-firebase-testing.appspot.com%2Fo%2F1mbTestFile.gif%3Falt%3Dmedia';
      const ref = firebase.storage().refFromURL(url);
      ref.bucket.should.equal('react-native-firebase-testing.appspot.com');
      ref.name.should.equal('1mbTestFile.gif');
      ref.toString().should.equal('gs://react-native-firebase-testing.appspot.com/1mbTestFile.gif');
    });

    it('throws an error if https url could not be parsed', async function () {
      try {
        firebase.storage().refFromURL('https://invertase.io');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("unable to parse 'url'");
        return Promise.resolve();
      }
    });

    it('accepts a gs url without a fullPath', async function () {
      const url = 'gs://some-bucket';
      const ref = firebase.storage().refFromURL(url);
      ref.toString().should.equal(url);
    });

    it('throws an error if url is not a string', async function () {
      try {
        firebase.storage().refFromURL({ derp: true });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'url' must be a string value");
        return Promise.resolve();
      }
    });

    it('throws an error if url does not start with gs:// or https://', async function () {
      try {
        firebase.storage().refFromURL('bs://foo/bar/cat.gif');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("begin with 'gs://'");
        return Promise.resolve();
      }
    });
  });

  describe('setMaxOperationRetryTime', function () {
    it('should set', async function () {
      firebase.storage().maxOperationRetryTime.should.equal(120000);
      await firebase.storage().setMaxOperationRetryTime(100000);
      firebase.storage().maxOperationRetryTime.should.equal(100000);
    });

    it('throws if time is not a number value', async function () {
      try {
        await firebase.storage().setMaxOperationRetryTime('im a teapot');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'time' must be a number value");
        return Promise.resolve();
      }
    });
  });

  describe('setMaxUploadRetryTime', function () {
    it('should set', async function () {
      firebase.storage().maxUploadRetryTime.should.equal(600000);
      await firebase.storage().setMaxUploadRetryTime(120000);
      firebase.storage().maxUploadRetryTime.should.equal(120000);
    });

    it('throws if time is not a number value', async function () {
      try {
        await firebase.storage().setMaxUploadRetryTime('im a teapot');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'time' must be a number value");
        return Promise.resolve();
      }
    });
  });

  describe('setMaxDownloadRetryTime', function () {
    it('should set', async function () {
      firebase.storage().maxDownloadRetryTime.should.equal(600000);
      await firebase.storage().setMaxDownloadRetryTime(120000);
      firebase.storage().maxDownloadRetryTime.should.equal(120000);
    });

    it('throws if time is not a number value', async function () {
      try {
        await firebase.storage().setMaxDownloadRetryTime('im a teapot');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'time' must be a number value");
        return Promise.resolve();
      }
    });
  });
});
