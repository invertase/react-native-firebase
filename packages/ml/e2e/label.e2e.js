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

let testImageFile;

describe('ml.label', function () {
  before(async function () {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/crab.jpg`;
    await firebase.storage().ref('vision/crab.jpg').writeToFile(testImageFile);
  });

  describe('cloudImageLabelerProcessImage()', function () {
    it('should throw if image path is not a string', function () {
      try {
        firebase.ml().cloudImageLabelerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    xit('should return a cloud label array', async function () {
      const res = await firebase.ml().cloudImageLabelerProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.text.should.be.String();
        i.entityId.should.be.String();
        i.confidence.should.be.Number();
      });
    });
  });

  describe('MLCloudImageLabelerOptions', function () {
    it('throws if not an object', async function () {
      try {
        await firebase.ml().cloudImageLabelerProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'cloudImageLabelerOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('confidenceThreshold', function () {
      it('should throw if confidence threshold is not a number', async function () {
        try {
          await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
            confidenceThreshold: '0.2',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudImageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1",
          );
          return Promise.resolve();
        }
      });

      it('should throw if confidence threshold is not between 0 & 1', async function () {
        try {
          await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
            confidenceThreshold: 1.1,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudImageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1",
          );
          return Promise.resolve();
        }
      });

      xit('should accept options and return cloud labels', async function () {
        const res = await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
          confidenceThreshold: 0.8,
        });

        res.should.be.Array();
        res.length.should.be.greaterThan(0);

        res.forEach(i => {
          i.text.should.be.String();
          i.entityId.should.be.String();
          i.confidence.should.be.Number();
        });
      });
    });

    describe('enforceCertFingerprintMatch', function () {
      it('throws if not a boolean', async function () {
        try {
          await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
            enforceCertFingerprintMatch: 'true',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudImageLabelerOptions.enforceCertFingerprintMatch' expected a boolean value",
          );
          return Promise.resolve();
        }
      });

      xit('sets enforceCertFingerprintMatch', async function () {
        await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
          enforceCertFingerprintMatch: false,
        });
      });
    });

    xdescribe('apiKeyOverride', function () {
      it('throws if apiKeyOverride is not a string', async function () {
        try {
          await firebase.ml().cloudImageLabelerProcessImage(testImageFile, {
            apiKeyOverride: true,
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          e.message.should.containEql(
            "'cloudImageLabelerOptions.apiKeyOverride' expected a string value",
          );
          return Promise.resolve();
        }
      });
    });
  });
});
