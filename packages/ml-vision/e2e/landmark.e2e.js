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

android.describe('mlkit.vision.landmark', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/landmark.jpg`;
    await firebase
      .storage()
      .ref('vision/landmark.jpg')
      .writeToFile(testImageFile);
  });

  describe('cloudLandmarkRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.vision().cloudLandmarkRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('should return an array of landmark information', async () => {
      const res = await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.landmark.should.be.String();
        i.entityId.should.be.String();
        i.confidence.should.be.Number();
        i.boundingBox.should.be.Array();
        i.boundingBox.length.should.eql(4);
        i.boundingBox.forEach(b => b.should.be.Number());
        i.locations.should.be.Array();
        i.locations.forEach(l => {
          l.should.be.Array();
          l.length.should.eql(2);
          l.forEach(p => p.should.be.Number());
        });
      });
    });
  });

  describe('VisionCloudLandmarkRecognizerOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          "'cloudLandmarkRecognizerOptions' expected an object value",
        );
        return Promise.resolve();
      }
    });

    describe('cloudLandmarkRecognizerOptions', () => {
      it('throws if not a boolean', async () => {
        try {
          await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
            enforceCertFingerprintMatch: 'false',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudLandmarkRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value",
          );
          return Promise.resolve();
        }
      });

      it('sets cloudLandmarkRecognizerOptions', async () => {
        await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
          enforceCertFingerprintMatch: false,
        });
      });
    });

    describe('maxResults', () => {
      it('throws if maxResults is not a number', async () => {
        try {
          await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
            maxResults: '2',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudLandmarkRecognizerOptions.maxResults' expected a number value",
          );
          return Promise.resolve();
        }
      });

      it('limits the maximum results', async () => {
        const res = await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
          maxResults: 3,
        });

        // TODO SDK returns random number of results on native
        // 1 = 0 result
        //  > 2 = 1 result
        res.should.be.Array();
      });
    });

    describe('modelType', () => {
      it('throws if model is invalid', async () => {
        try {
          await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
            modelType: 3,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudLandmarkRecognizerOptions.modelType' invalid model",
          );
          return Promise.resolve();
        }
      });

      it('sets modelType', async () => {
        await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
          modelType: firebase.vision.VisionCloudLandmarkRecognizerModelType.STABLE_MODEL,
        });

        await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
          modelType: firebase.vision.VisionCloudLandmarkRecognizerModelType.LATEST_MODEL,
        });
      });

      it('uses a latest model', async () => {
        const res = await firebase.vision().cloudLandmarkRecognizerProcessImage(testImageFile, {
          modelType: firebase.vision.VisionCloudLandmarkRecognizerModelType.LATEST_MODEL,
        });
        res.should.be.Array();
      });
    });
  });
});
