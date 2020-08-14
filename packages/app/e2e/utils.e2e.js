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

  describe('playServicesAvailability', () => {
    it('returns isAvailable and Play Service status', async () => {
      const playService = await firebase.utils().playServicesAvailability;
      //iOS always returns { isAvailable: true, status: 0}
      should(playService.isAvailable).equal(true);
      should(playService.status).equal(0);
    });
  });

  describe('getPlayServicesStatus', () => {
    it('returns isAvailable and Play Service status', async () => {
      const status = await firebase.utils().getPlayServicesStatus();
      //iOS always returns { isAvailable: true, status: 0}
      should(status.isAvailable).equal(true);
      should(status.status).equal(0);
    });
  });
});
