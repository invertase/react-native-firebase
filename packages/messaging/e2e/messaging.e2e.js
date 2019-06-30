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

describe.only('messaging()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.messaging);
      app.messaging().app.should.equal(app);
    });
  });

  describe('aMethod()', () => {
    it('accessible from firebase.app()', async () => {
      const spy = sinon.spy();
      const unsub = firebase.messaging().onMessage(spy);
      const token = await firebase.messaging().getToken();
      // await device.sendToHome();
      await TestsAPI.messaging().sendToDevice(token, {
        data: {
          foo: 'bar',
          doop: 'boop',
        },
        // notification: {
        //   title: 'hello',
        //   body: 'world',
        // },
      });
      await Utils.spyToBeCalledOnceAsync(spy);
      // await device.launchApp({ newInstance: false });
      console.dir(spy.firstCall.args[0]);
      unsub();
    });
  });
});
