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

describe('links()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.links);
      app.links().app.should.equal(app);
    });
  });

  // Tests TODO
  xdescribe('aMethod()', () => {
    it('foo', async () => {
      // await device.relaunchApp({ url: 'https://invertase.io/links-test', newInstance: true });
      // firebase.links().onLink(console.dir);
      // await device.relaunchApp({ url: 'https://invertase.io/links-test', newInstance: false });
      // await Utils.sleep(3000);
      // const result = await firebase.links().getInitialLink();
      // await device.relaunchApp({ url: 'https://invertase.io/links-test', newInstance: false });
    });
  });
});
