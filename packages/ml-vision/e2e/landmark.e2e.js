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
describe.only('mlkit.vision.landmark', () => {
  before(async () => {
    testImageFile = `${firebase.storage.Path.DocumentDirectory}/landmark.jpg`;
    await firebase
      .storage()
      .ref('vision/landmark.jpg')
      .getFile(testImageFile);
  });

  describe('cloudLandmarkRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().cloudLandmarkRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().cloudLandmarkRecognizerProcessImage('foo', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'cloudLandmarkRecognizerOptions' expected an instance of VisionCloudLandmarkRecognizerOptions`,
        );
        return Promise.resolve();
      }
    });

    it('should return an array of landmark information', async () => {
      const res = await firebase.mlKitVision().cloudLandmarkRecognizerProcessImage(testImageFile);

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
    // TODO how to test?
    describe('enforceCertFingerprintMatch()', () => {
      it('enforces fingerpint match without error', () => {
        new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().enforceCertFingerprintMatch();
      });
    });

    describe('setMaxResults()', () => {
      it('throws if maxNumber is not a number', () => {
        try {
          new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setMaxResults('2');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'maxResults' expected a number value`);
          return Promise.resolve();
        }
      });

      it('returns instance', () => {
        const i = new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setMaxResults(2);
        i.constructor.name.should.eql('VisionCloudLandmarkRecognizerOptions');
      });

      it('limits the maximum results', async () => {
        const o = new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setMaxResults(3);

        const res = await firebase
          .mlKitVision()
          .cloudLandmarkRecognizerProcessImage(testImageFile, o);

        // TODO SDK returns random number of results on native
        // 1 = 0 result
        //  > 2 = 1 result
        res.should.be.Array();
      });
    });

    describe('setModelType()', () => {
      it('throws if model is invalid', () => {
        try {
          new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setModelType(3);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(`'model' invalid model`);
          return Promise.resolve();
        }
      });

      it('returns instance', () => {
        const i1 = new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setModelType(
          firebase.mlKitVision.VisionCloudLandmarkRecognizerModelType.STABLE_MODEL,
        );
        const i2 = new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setModelType(
          firebase.mlKitVision.VisionCloudLandmarkRecognizerModelType.LATEST_MODEL,
        );

        i1.constructor.name.should.eql('VisionCloudLandmarkRecognizerOptions');
        i2.constructor.name.should.eql('VisionCloudLandmarkRecognizerOptions');
      });

      it('uses a latest model', async () => {
        const o = new firebase.mlKitVision.VisionCloudLandmarkRecognizerOptions().setModelType(
          firebase.mlKitVision.VisionCloudLandmarkRecognizerModelType.LATEST_MODEL,
        );

        const res = await firebase
          .mlKitVision()
          .cloudLandmarkRecognizerProcessImage(testImageFile, o);
        res.should.be.Array();
      });
    });
  });
});
