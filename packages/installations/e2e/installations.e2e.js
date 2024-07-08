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

import { Base64 } from '@react-native-firebase/app/lib/common';

function decodeJWT(token) {
  // Split the token into its parts
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  // Decode the base64 URL parts
  const base64UrlDecode = str => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64.length % 4) {
      case 0:
        break;
      case 2:
        base64 += '==';
        break;
      case 3:
        base64 += '=';
        break;
      default:
        throw new Error('Invalid base64 string');
    }

    return decodeURIComponent(
      Base64.atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
  };

  // Decode the payload
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  return payload;
}

const ID_LENGTH = 22;
const PROJECT_ID = 448618578101; // this is "magic", it's the react-native-firebase-testing project ID

describe('installations() modular', function () {
  describe('firebase v8 compatibility', function () {
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
        const decodedToken = decodeJWT(token);
        decodedToken.fid.should.equal(id); // fid == firebase installations id
        decodedToken.projectNumber.should.equal(PROJECT_ID);

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(
            new Error('Token already expired: ' + JSON.stringify(decodedToken)),
          );
        }

        const token2 = await firebase.installations().getToken(true);
        token2.should.be.a.String();
        token2.should.not.equal('');
        const decodedToken2 = decodeJWT(token2);
        decodedToken2.fid.should.equal(id);
        decodedToken2.projectNumber.should.equal(PROJECT_ID);

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(new Error('Token already expired'));
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
        const decodedToken = decodeJWT(token);
        decodedToken.fid.should.equal(id2); // fid == firebase installations id

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        decodedToken.projectNumber.should.equal(PROJECT_ID);
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(new Error('Token already expired'));
        }
      });
    });
  });

  describe('modular', function () {
    describe('getId()', function () {
      it('returns a valid installation id', async function () {
        const { getInstallations, getId } = installationsModular;
        const installations = getInstallations();

        const id = await getId(installations);
        id.should.be.a.String();
        id.length.should.be.equals(ID_LENGTH);
      });
    });

    describe('getToken()', function () {
      it('returns a valid auth token with no arguments', async function () {
        const { getInstallations, getId, getToken } = installationsModular;
        const installations = getInstallations();

        const id = await getId(installations);
        const token = await getToken(installations);
        token.should.be.a.String();
        token.should.not.equal('');
        const decodedToken = decodeJWT(token);
        decodedToken.fid.should.equal(id); // fid == firebase installations id
        decodedToken.projectNumber.should.equal(PROJECT_ID);

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(
            new Error('Token already expired: ' + JSON.stringify(decodedToken)),
          );
        }

        const token2 = await getToken(installations, true);
        token2.should.be.a.String();
        token2.should.not.equal('');
        const decodedToken2 = decodeJWT(token2);
        decodedToken2.fid.should.equal(id);
        decodedToken2.projectNumber.should.equal(PROJECT_ID);

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(new Error('Token already expired'));
        }
        (token === token2).should.be.false();
      });
    });

    describe('deleteInstallations()', function () {
      it('successfully deletes', async function () {
        const { getInstallations, getId, getToken, deleteInstallations } = installationsModular;
        const installations = getInstallations();

        const id = await getId(installations);
        id.should.be.a.String();
        id.length.should.be.equals(ID_LENGTH);
        await deleteInstallations(installations);

        // New id should be different
        const id2 = await getId(installations);
        id2.should.be.a.String();
        id2.length.should.be.equals(ID_LENGTH);
        (id === id2).should.be.false();

        const token = await getToken(installations, false);
        const decodedToken = decodeJWT(token);
        decodedToken.fid.should.equal(id2); // fid == firebase installations id

        // token time is "Unix epoch time", which is in seconds vs javascript milliseconds
        decodedToken.projectNumber.should.equal(PROJECT_ID);
        if (decodedToken.exp < Math.round(new Date().getTime() / 1000)) {
          return Promise.reject(new Error('Token already expired'));
        }
      });
    });
  });
});
