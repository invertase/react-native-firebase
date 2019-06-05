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

describe('indexing()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.indexing);
      app.indexing().app.should.equal(app);
    });
  });

  describe('getInitialURL()', () => {
    it('should return null with no deeplink', async () => {
      const url = await firebase.indexing().getInitialURL();
      should.equal(url, null);
    });

    // does not work on ios simulator
    android.it('should be a string when app launches from a URL', async () => {
      const url = 'invertase://foo.bar';
      await device.relaunchApp({
        url,
        newInstance: true,
      });

      const opened = await firebase.indexing().getInitialURL();
      should.equal(opened, url);
    });
  });

  describe('onOpenURL()', () => {
    it('throw when no function is provided', () => {
      try {
        firebase.indexing().onOpenURL('foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (error) {
        error.message.should.containEql(`'listener' must be a function`);
        return Promise.resolve();
      }
    });

    it('returns an unsubscribe function', () => {
      const sub = () => {};
      const unsubscribe = firebase.indexing().onOpenURL(sub);
      unsubscribe.should.be.a.Function();
      unsubscribe();
    });

    it('subscribes to and receives URL events', async () => {
      const url = 'invertase://foo.bar';
      const callback = sinon.spy();
      const unsubscribe = firebase.indexing().onOpenURL(callback);
      await device.openURL({
        url,
      });
      await Utils.sleep(200);
      callback.should.be.calledOnce();
      callback.should.be.calledWith(url);
      unsubscribe();
    });
  });
});
