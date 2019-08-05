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

android.describe('mlkit.vision.face', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/faces.jpg`;
    await firebase
      .storage()
      .ref('vision/faces.jpg')
      .writeToFile(testImageFile);
  });

  describe('faceDetectorProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.vision().faceDetectorProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('returns basic face object with no options enabled', async () => {
      const res = await firebase.vision().faceDetectorProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        // Currently disabled
        i.trackingId.should.eql(-1);

        i.rightEyeOpenProbability.should.eql(-1);
        i.leftEyeOpenProbability.should.eql(-1);
        i.smilingProbability.should.eql(-1);

        i.landmarks.length.should.eql(0);
        i.faceContours.length.should.eql(0);

        i.boundingBox.length.should.eql(4);

        i.headEulerAngleZ.should.be.Number();
        i.headEulerAngleY.should.be.Number();
      });
    });

    it('returns classifications if enabled', async () => {
      const res = await firebase.vision().faceDetectorProcessImage(testImageFile, {
        classificationMode: 2,
      });

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.rightEyeOpenProbability.should.greaterThan(-1);
        i.leftEyeOpenProbability.should.greaterThan(-1);
        i.smilingProbability.should.greaterThan(-1);
      });
    });

    it('returns landmarks if enabled', async () => {
      const res = await firebase.vision().faceDetectorProcessImage(testImageFile, {
        landmarkMode: 2,
      });
      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.landmarks.length.should.be.greaterThan(0);

        i.landmarks.forEach(l => {
          l.type.should.be.Number();
          l.position.length.should.be.eql(2);
          l.position.forEach(p => p.should.be.Number());
        });
      });
    });

    it('returns contours if enabled', async () => {
      const res = await firebase.vision().faceDetectorProcessImage(testImageFile, {
        contourMode: 2,
      });
      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.faceContours.length.should.be.greaterThan(0);

        i.faceContours.forEach(l => {
          l.type.should.be.Number();
          l.points.length.should.be.greaterThan(1);
          l.points.forEach(p => {
            p.should.be.Array();
            p.length.should.be.eql(2);
          });
        });
      });
    });
  });

  describe('VisionFaceDetectorOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.vision().faceDetectorProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'faceDetectorOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('classificationMode', () => {
      it('throws if mode is incorrect', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            classificationMode: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'faceDetectorOptions.classificationMode' invalid classification mode",
          );
          return Promise.resolve();
        }
      });

      it('sets classificationMode', async () => {
        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          classificationMode:
            firebase.vision.VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS,
        });

        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          classificationMode:
            firebase.vision.VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS,
        });
      });
    });

    describe('contourMode', () => {
      it('throws if mode is incorrect', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            contourMode: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'faceDetectorOptions.contourMode' invalid contour mode");
          return Promise.resolve();
        }
      });

      it('sets contourMode', async () => {
        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          contourMode: firebase.vision.VisionFaceDetectorContourMode.NO_CONTOURS,
        });

        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          contourMode: firebase.vision.VisionFaceDetectorContourMode.ALL_CONTOURS,
        });
      });
    });

    describe('performanceMode', () => {
      it('throws if mode is incorrect', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            performanceMode: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'faceDetectorOptions.performanceMode' invalid performance mode",
          );
          return Promise.resolve();
        }
      });

      it('sets performanceMode', async () => {
        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          performanceMode: firebase.vision.VisionFaceDetectorPerformanceMode.FAST,
        });

        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          performanceMode: firebase.vision.VisionFaceDetectorPerformanceMode.ACCURATE,
        });
      });
    });

    describe('landmarkMode', () => {
      it('throws if mode is incorrect', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            landmarkMode: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'faceDetectorOptions.landmarkMode' invalid landmark mode",
          );
          return Promise.resolve();
        }
      });

      it('sets landmarkMode', async () => {
        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          landmarkMode: firebase.vision.VisionFaceDetectorLandmarkMode.NO_LANDMARKS,
        });

        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          landmarkMode: firebase.vision.VisionFaceDetectorLandmarkMode.ALL_LANDMARKS,
        });
      });
    });

    describe('minFaceSize', () => {
      it('throws if size is not a number', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            minFaceSize: '0.1',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'faceDetectorOptions.minFaceSize' expected a number value between 0 & 1",
          );
          return Promise.resolve();
        }
      });

      it('throws if size is not valid', async () => {
        try {
          await firebase.vision().faceDetectorProcessImage(testImageFile, {
            minFaceSize: -1,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'faceDetectorOptions.minFaceSize' expected value to be between 0 & 1",
          );
          return Promise.resolve();
        }
      });

      it('sets minFaceSize', async () => {
        await firebase.vision().faceDetectorProcessImage(testImageFile, {
          minFaceSize: 0.3,
        });
      });
    });
  });
});
