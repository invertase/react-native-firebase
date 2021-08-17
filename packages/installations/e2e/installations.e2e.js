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

const jwt = require('jsonwebtoken');

const ID_LENGTH = 22;
const PROJECT_ID = 448618578101; // this is "magic", it's the react-native-firebase-testing project ID

describe('installations()', function () {
  describe('getId()', function () {
    it('returns a valid installation id', async function () {
      const id = await firebase.installations().getId();
      id.should.be.a.String();
      id.length.should.be.equals(ID_LENGTH);
    });
  });

  describe('getToken()', function () {
    it('returns a valid auth token with no arguments', async function () {
      const id = await firebase.installations().getId();
      const token = await firebase.installations().getToken();
      token.should.be.a.String();
      token.should.not.equal('');
      const decodedToken = jwt.decode(token);
      decodedToken.fid.should.equal(id); // fid == firebase installations id
      decodedToken.projectNumber.should.equal(PROJECT_ID);
      if (decodedToken.exp < Date.now()) {
        Promise.reject('Token already expired');
      }

      const token2 = await firebase.installations().getToken(true);
      token2.should.be.a.String();
      token2.should.not.equal('');
      const decodedToken2 = jwt.decode(token2);
      decodedToken2.fid.should.equal(id);
      decodedToken2.projectNumber.should.equal(PROJECT_ID);
      if (decodedToken2.exp < Date.now()) {
        Promise.reject('Token already expired');
      }
      (token === token2).should.be.false();
    });
  });

  describe('delete()', function () {
    it('successfully deletes', async function () {
      const id = await firebase.installations().getId();
      id.should.be.a.String();
      id.length.should.be.equals(ID_LENGTH);
      await firebase.installations().delete();

      // New id should be different
      const id2 = await firebase.installations().getId();
      id2.should.be.a.String();
      id2.length.should.be.equals(ID_LENGTH);
      (id === id2).should.be.false();

      const token = await firebase.installations().getToken(false);
      const decodedToken = jwt.decode(token);
      decodedToken.fid.should.equal(id2); // fid == firebase installations id
      decodedToken.projectNumber.should.equal(PROJECT_ID);
      if (decodedToken.exp < Date.now()) {
        Promise.reject('Token already expired');
      }
    });
  });
});
