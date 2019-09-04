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

describe('utils()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.utils);
      app.utils().app.should.equal(app);
    });
  });

  describe('isRunningInTestLab', () => {
    it('returns true or false', () => {
      should.equal(firebase.utils().isRunningInTestLab, false);
    });
  });

  describe('logger', () => {
    it('throws if config is not an object', () => {
      try {
        firebase.utils().enableLogger(5);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql('Invalid config passed to enableLogger');
        return Promise.resolve();
      }
    });

    it("throws if config object doesn't contain at least one valid option", () => {
      try {
        firebase.utils().enableLogger({ invalidOption: true });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'enableLogger expects at least one option: enableMethodLogging or enableEventLogging',
        );
        return Promise.resolve();
      }
    });

    it('enables logging correctly', () => {
      const config = firebase
        .utils()
        .enableLogger({ enableMethodLogging: true, enableEventLogging: true });
      config.enableMethodLogging.should.eql(true);
      config.enableEventLogging.should.eql(true);
    });

    it('throws if non string text was passed to .info', () => {
      try {
        firebase
          .utils()
          .logger()
          .info(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'Invalid text passed to logger. Expected string, but got number',
        );
        return Promise.resolve();
      }
    });

    it('logs correctly', () => {
      try {
        firebase
          .utils()
          .logger()
          .info('Custom Log');
      } catch (e) {
        Promise.reject(new Error(e.message));
      }
    });

    it('throws if incorrect params were passed', () => {
      try {
        firebase
          .utils()
          .logger()
          .info('Custom Log', 123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'Invalid params passed to logger. Expected array or object, but got number',
        );
        return Promise.resolve();
      }
    });

    it('logs correctly with params', () => {
      try {
        firebase
          .utils()
          .logger()
          .info('Custom Log', { uid: 123 });
      } catch (e) {
        Promise.reject(new Error(e.message));
      }
    });
  });
});
