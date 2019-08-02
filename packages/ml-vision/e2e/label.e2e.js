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

android.describe('mlkit.vision.label', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/crab.jpg`;
    await firebase
      .storage()
      .ref('vision/crab.jpg')
      .writeToFile(testImageFile);
  });

  describe('imageLabelerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.vision().imageLabelerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('should return a local label array', async () => {
      const res = await firebase.vision().imageLabelerProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.text.should.be.String();
        i.entityId.should.be.String();
        i.confidence.should.be.Number();
      });
    });
  });

  describe('cloudImageLabelerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.vision().cloudImageLabelerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('should return a cloud label array', async () => {
      const res = await firebase.vision().cloudImageLabelerProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.text.should.be.String();
        i.entityId.should.be.String();
        i.confidence.should.be.Number();
      });
    });
  });

  describe('VisionImageLabelerOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.vision().imageLabelerProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'imageLabelerOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('confidenceThreshold', () => {
      it('should throw if confidence threshold is not a number', async () => {
        try {
          await firebase.vision().imageLabelerProcessImage(testImageFile, {
            confidenceThreshold: '0.5',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'imageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1",
          );
          return Promise.resolve();
        }
      });
    });

    it('should throw if confidence threshold is not between 0 & 1', async () => {
      try {
        await firebase.vision().imageLabelerProcessImage(testImageFile, {
          confidenceThreshold: -0.2,
        });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "'imageLabelerOptions.confidenceThreshold' expected a number value between 0 & 1",
        );
        return Promise.resolve();
      }
    });

    it('should accept options and return local labels', async () => {
      const res = await firebase.vision().imageLabelerProcessImage(testImageFile, {
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

  describe('VisionCloudImageLabelerOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.vision().cloudImageLabelerProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'cloudImageLabelerOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('confidenceThreshold', () => {
      it('should throw if confidence threshold is not a number', async () => {
        try {
          await firebase.vision().cloudImageLabelerProcessImage(testImageFile, {
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

      it('should throw if confidence threshold is not between 0 & 1', async () => {
        try {
          await firebase.vision().cloudImageLabelerProcessImage(testImageFile, {
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

      it('should accept options and return cloud labels', async () => {
        const res = await firebase.vision().cloudImageLabelerProcessImage(testImageFile, {
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

    describe('enforceCertFingerprintMatch', () => {
      it('throws if not a boolean', async () => {
        try {
          await firebase.vision().cloudImageLabelerProcessImage(testImageFile, {
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

      it('sets enforceCertFingerprintMatch', async () => {
        await firebase.vision().cloudImageLabelerProcessImage(testImageFile, {
          enforceCertFingerprintMatch: false,
        });
      });
    });
  });
});
