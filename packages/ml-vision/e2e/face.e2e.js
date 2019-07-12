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

describe('mlkit.vision.face', () => {
  before(async () => {
    testImageFile = `${firebase.storage.Path.DocumentDirectory}/faces.jpg`;
    await firebase
      .storage()
      .ref('vision/faces.jpg')
      .getFile(testImageFile);
  });

  describe('faceDetectorProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().faceDetectorProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().faceDetectorProcessImage('foo', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'faceDetectorOptions' expected an instance of VisionFaceDetectorOptions`,
        );
        return Promise.resolve();
      }
    });

    it('returns basic face object with no options enabled', async () => {
      const res = await firebase.mlKitVision().faceDetectorProcessImage(testImageFile);

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
      const o = new firebase.mlKitVision.VisionFaceDetectorOptions();
      o.setClassificationMode(2);

      const res = await firebase.mlKitVision().faceDetectorProcessImage(testImageFile, o);
      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.rightEyeOpenProbability.should.greaterThan(-1);
        i.leftEyeOpenProbability.should.greaterThan(-1);
        i.smilingProbability.should.greaterThan(-1);
      });
    });

    it('returns landmarks if enabled', async () => {
      const o = new firebase.mlKitVision.VisionFaceDetectorOptions();
      o.setLandmarkMode(2);

      const res = await firebase.mlKitVision().faceDetectorProcessImage(testImageFile, o);
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
      const o = new firebase.mlKitVision.VisionFaceDetectorOptions();
      o.setContourMode(2);

      const res = await firebase.mlKitVision().faceDetectorProcessImage(testImageFile, o);
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
    describe('setClassificationMode()', () => {
      it('throws if mode is incorrect', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setClassificationMode(3);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'classificationMode' invalid classification mode`);
          return Promise.resolve();
        }
      });

      it('sets classification and returns an instance', () => {
        const i1 = new firebase.mlKitVision.VisionFaceDetectorOptions().setClassificationMode(
          firebase.mlKitVision.VisionFaceDetectorClassificationMode.NO_CLASSIFICATIONS,
        );

        const i2 = new firebase.mlKitVision.VisionFaceDetectorOptions().setClassificationMode(
          firebase.mlKitVision.VisionFaceDetectorClassificationMode.ALL_CLASSIFICATIONS,
        );

        i1.constructor.name.should.eql('VisionFaceDetectorOptions');
        i2.constructor.name.should.eql('VisionFaceDetectorOptions');
      });
    });

    describe('setContourMode()', () => {
      it('throws if mode is incorrect', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setContourMode(3);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'contourMode' invalid contour mode`);
          return Promise.resolve();
        }
      });

      it('sets contour mode and returns an instance', () => {
        const i1 = new firebase.mlKitVision.VisionFaceDetectorOptions().setContourMode(
          firebase.mlKitVision.VisionFaceDetectorContourMode.NO_CONTOURS,
        );

        const i2 = new firebase.mlKitVision.VisionFaceDetectorOptions().setContourMode(
          firebase.mlKitVision.VisionFaceDetectorContourMode.ALL_CONTOURS,
        );

        i1.constructor.name.should.eql('VisionFaceDetectorOptions');
        i2.constructor.name.should.eql('VisionFaceDetectorOptions');
      });
    });

    describe('setPerformanceMode()', () => {
      it('throws if mode is incorrect', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setPerformanceMode(3);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'performanceMode' invalid performance mode`);
          return Promise.resolve();
        }
      });

      it('sets contour mode and returns an instance', () => {
        const i1 = new firebase.mlKitVision.VisionFaceDetectorOptions().setPerformanceMode(
          firebase.mlKitVision.VisionFaceDetectorPerformanceMode.FAST,
        );

        const i2 = new firebase.mlKitVision.VisionFaceDetectorOptions().setPerformanceMode(
          firebase.mlKitVision.VisionFaceDetectorPerformanceMode.ACCURATE,
        );

        i1.constructor.name.should.eql('VisionFaceDetectorOptions');
        i2.constructor.name.should.eql('VisionFaceDetectorOptions');
      });
    });

    describe('setLandmarkMode()', () => {
      it('throws if mode is incorrect', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setLandmarkMode(3);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'landmarkMode' invalid landmark mode`);
          return Promise.resolve();
        }
      });

      it('sets landmark mode and returns an instance', () => {
        const i1 = new firebase.mlKitVision.VisionFaceDetectorOptions().setLandmarkMode(
          firebase.mlKitVision.VisionFaceDetectorLandmarkMode.NO_LANDMARKS,
        );

        const i2 = new firebase.mlKitVision.VisionFaceDetectorOptions().setPerformanceMode(
          firebase.mlKitVision.VisionFaceDetectorLandmarkMode.ALL_LANDMARKS,
        );

        i1.constructor.name.should.eql('VisionFaceDetectorOptions');
        i2.constructor.name.should.eql('VisionFaceDetectorOptions');
      });
    });

    describe('setMinFaceSize()', () => {
      it('throws if size is not a number', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setMinFaceSize('0.5');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'minFaceSize' expected a number value between 0 & 1`);
          return Promise.resolve();
        }
      });

      it('throws if size is not valid', () => {
        try {
          new firebase.mlKitVision.VisionFaceDetectorOptions().setMinFaceSize(-1);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'minFaceSize' expected value to be between 0 & 1`);
          return Promise.resolve();
        }
      });

      it('sets face size and returns an instance', () => {
        const i = new firebase.mlKitVision.VisionFaceDetectorOptions().setMinFaceSize(0.5);

        i.constructor.name.should.eql('VisionFaceDetectorOptions');
      });
    });
  });
});
