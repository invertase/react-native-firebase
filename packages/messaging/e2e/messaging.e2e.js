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

describe('messaging()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.messaging);
      app.messaging().app.should.equal(app);
    });
  });

  describe('onMessage()', () => {
    android.it('receives messages when the app is in the foreground', async () => {
      const spy = sinon.spy();
      const unsubscribe = firebase.messaging().onMessage(spy);
      const token = await firebase.messaging().getToken();
      await TestsAPI.messaging().sendToDevice(token, {
        data: {
          foo: 'bar',
          doop: 'boop',
        },
      });
      await Utils.spyToBeCalledOnceAsync(spy);
      unsubscribe();
      spy.firstCall.args[0].should.be.an.Object();
      spy.firstCall.args[0].data.should.be.an.Object();
      spy.firstCall.args[0].data.foo.should.eql('bar');
    });
  });

  describe('setBackgroundMessageHandler()', () => {
    android.it('receives messages when the app is in the background', async () => {
      const spy = sinon.spy();
      const token = await firebase.messaging().getToken();
      firebase.messaging().setBackgroundMessageHandler(remoteMessage => {
        spy(remoteMessage);
        return Promise.resolve();
      });

      await device.sendToHome();
      await TestsAPI.messaging().sendToDevice(token, {
        data: {
          foo: 'bar',
          doop: 'boop',
        },
      });
      await Utils.spyToBeCalledOnceAsync(spy);
      await device.launchApp({ newInstance: false });
      spy.firstCall.args[0].should.be.an.Object();
      spy.firstCall.args[0].data.should.be.an.Object();
      spy.firstCall.args[0].data.foo.should.eql('bar');
    });
  });
});
