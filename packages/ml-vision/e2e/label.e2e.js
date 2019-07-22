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
        firebase.mlKitVision().imageLabelerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().imageLabelerProcessImage('foo', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'imageLabelerOptions' expected an instance of VisionImageLabelerOptions`,
        );
        return Promise.resolve();
      }
    });

    it('should return a local label array', async () => {
      const res = await firebase.mlKitVision().imageLabelerProcessImage(testImageFile);

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
        firebase.mlKitVision().cloudImageLabelerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().cloudImageLabelerProcessImage('foo', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'cloudImageLabelerOptions' expected an instance of VisionCloudImageLabelerOptions`,
        );
        return Promise.resolve();
      }
    });

    it('should return a cloud label array', async () => {
      const res = await firebase.mlKitVision().cloudImageLabelerProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);

      res.forEach(i => {
        i.text.should.be.String();
        i.entityId.should.be.String();
        i.confidence.should.be.Number();
      });
    });
  });

  describe('VisionImageLabelerOptions.setConfidenceThreshold()', () => {
    it('should throw if confidence threshold is not a number', () => {
      try {
        const options = new firebase.mlKitVision.VisionImageLabelerOptions();
        options.setConfidenceThreshold('0.5');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'confidenceThreshold' expected a number value between 0 & 1`,
        );
        return Promise.resolve();
      }
    });

    it('should throw if confidence threshold is between 0 & 1', () => {
      try {
        const options = new firebase.mlKitVision.VisionImageLabelerOptions();
        options.setConfidenceThreshold(1.1);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'confidenceThreshold' expected value to be between 0 & 1`);
        return Promise.resolve();
      }
    });

    it('should return the class', () => {
      const options = new firebase.mlKitVision.VisionImageLabelerOptions().setConfidenceThreshold(
        0.8,
      );

      options.constructor.name.should.eql('VisionImageLabelerOptions');
    });

    it('should accept options and return local labels', async () => {
      const options = new firebase.mlKitVision.VisionImageLabelerOptions();
      options.setConfidenceThreshold(0.8);

      const res = await firebase.mlKitVision().imageLabelerProcessImage(testImageFile, options);

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
    describe('setConfidenceThreshold()', () => {
      it('should throw if confidence threshold is not a number', () => {
        try {
          const options = new firebase.mlKitVision.VisionCloudImageLabelerOptions();
          options.setConfidenceThreshold('0.5');
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            `'confidenceThreshold' expected a number value between 0 & 1`,
          );
          return Promise.resolve();
        }
      });

      it('should throw if confidence threshold is between 0 & 1', () => {
        try {
          const options = new firebase.mlKitVision.VisionCloudImageLabelerOptions();
          options.setConfidenceThreshold(1.1);
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            `'confidenceThreshold' expected value to be between 0 & 1`,
          );
          return Promise.resolve();
        }
      });

      it('should return the class', () => {
        const options = new firebase.mlKitVision.VisionCloudImageLabelerOptions().setConfidenceThreshold(
          0.8,
        );

        options.constructor.name.should.eql('VisionCloudImageLabelerOptions');
      });

      it('should accept options and return cloud labels', async () => {
        const options = new firebase.mlKitVision.VisionCloudImageLabelerOptions();
        options.setConfidenceThreshold(0.8);

        const res = await firebase
          .mlKitVision()
          .cloudImageLabelerProcessImage(testImageFile, options);

        res.should.be.Array();
        res.length.should.be.greaterThan(0);

        res.forEach(i => {
          i.text.should.be.String();
          i.entityId.should.be.String();
          i.confidence.should.be.Number();
        });
      });
    });

    describe('enforceCertFingerprintMatch()', () => {
      it('enforceCertFingerprintMatch()', () => {
        const o = new firebase.mlKitVision.VisionCloudImageLabelerOptions();
        o.enforceCertFingerprintMatch();
        o.get('enforceCertFingerprintMatch').should.equal(true);
      });
    });
  });
});
