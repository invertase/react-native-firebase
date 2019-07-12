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

function textBaseElementValidate(textBase, cloud = false) {
  // text
  textBase.text.should.be.a.String();

  // confidence
  if (cloud) {
    // TODO android always returning null - SDK issue
    // textBase.confidence.should.be.a.Number();
  } else {
    should.equal(textBase.confidence, null);
  }

  // corner points
  textBase.cornerPoints.should.be.an.Array();
  if (!cloud) {
    textBase.cornerPoints.length.should.be.greaterThan(0);
    textBase.cornerPoints.forEach(cornerPoint => {
      cornerPoint.should.be.an.Array();
      cornerPoint.length.should.equal(2);
      cornerPoint[0].should.be.a.Number();
      cornerPoint[1].should.be.a.Number();
    });
  } else {
    textBase.cornerPoints.length.should.equal(0);
  }

  // bounding box
  textBase.boundingBox.should.be.an.Array();
  textBase.boundingBox[0].should.be.a.Number();
  textBase.boundingBox[1].should.be.a.Number();
  textBase.boundingBox[2].should.be.a.Number();
  textBase.boundingBox[3].should.be.a.Number();

  // cornerPoints
  textBase.cornerPoints.should.be.an.Array();

  if (!cloud) {
    // TODO cloud API on Android sdk always returns null; SDK issue
    textBase.cornerPoints.length.should.be.greaterThan(0);
    textBase.cornerPoints.forEach(cornerPoint => {
      cornerPoint[0].should.be.a.Number();
      cornerPoint[1].should.be.a.Number();
    });
  }

  // recognizedLanguages
  textBase.recognizedLanguages.should.be.an.Array();
  if (cloud) {
    textBase.recognizedLanguages.length.should.be.greaterThan(0);
  } else {
    textBase.recognizedLanguages.length.should.equal(0);
  }
}

let testImageFile;

describe('mlkit.vision.text', () => {
  before(async () => {
    testImageFile = `${firebase.storage.Path.DocumentDirectory}/text.png`;
    await firebase
      .storage()
      .ref('vision/text.png')
      .getFile(testImageFile);
  });
  describe('textRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().textRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should return a VisionText representation for an image', async () => {
      const res = await firebase.mlKitVision().textRecognizerProcessImage(testImageFile);
      res.text.should.be.a.String();
      res.blocks.should.be.an.Array();
      res.blocks.length.should.be.greaterThan(0);

      res.blocks.forEach(textBlock => {
        textBaseElementValidate(textBlock);
        textBlock.lines.should.be.an.Array();
        textBlock.lines.length.should.be.greaterThan(0);
        textBlock.lines.forEach(line => {
          textBaseElementValidate(line);
          line.elements.should.be.an.Array();
          line.elements.length.should.be.greaterThan(0);
          line.elements.forEach(element => {
            textBaseElementValidate(element);
          });
        });
      });
    });
  });

  describe('VisionCloudTextRecognizerOptions', () => {
    it('enforceCertFingerprintMatch()', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      o.enforceCertFingerprintMatch();
      o.get('enforceCertFingerprintMatch').should.equal(true);
    });

    it('setLanguageHints()', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      o.setLanguageHints(['en']);
      o.get('hintedLanguages').should.be.an.Array();
      o.get('hintedLanguages')[0].should.equal('en');
    });

    it('setLanguageHints() - throws if not an array', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      try {
        o.setLanguageHints('invertase');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });

    it('setLanguageHints() - throws if empty array', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      try {
        o.setLanguageHints([]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });

    it('setLanguageHints() - throws array not strings', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      try {
        o.setLanguageHints([1, 2, 3]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });

    it('setModelType()', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      firebase.mlKitVision.VisionCloudTextRecognizerModelType.SPARSE_MODEL.should.equal(1);
      firebase.mlKitVision.VisionCloudTextRecognizerModelType.DENSE_MODEL.should.equal(2);
      o.setModelType(firebase.mlKitVision.VisionCloudTextRecognizerModelType.SPARSE_MODEL);
      o.get('modelType').should.equal(
        firebase.mlKitVision.VisionCloudTextRecognizerModelType.SPARSE_MODEL,
      );
      o.setModelType(firebase.mlKitVision.VisionCloudTextRecognizerModelType.DENSE_MODEL);
      o.get('modelType').should.equal(
        firebase.mlKitVision.VisionCloudTextRecognizerModelType.DENSE_MODEL,
      );
    });

    it('setModelType() - throws if not a valid model type', () => {
      const o = new firebase.mlKitVision.VisionCloudTextRecognizerOptions();
      try {
        o.setModelType('invertase');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'modelType' must be one of VisionCloudTextRecognizerModelType.DENSE_MODEL or .SPARSE_MODEL`,
        );
        return Promise.resolve();
      }
    });
  });

  describe('cloudTextRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().cloudTextRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().cloudTextRecognizerProcessImage('invertase', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'cloudTextRecognizerOptions' expected an instance of VisionCloudTextRecognizerOptions`,
        );
        return Promise.resolve();
      }
    });

    it('should return a VisionText representation for an image', async () => {
      const res = await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile);
      res.text.should.be.a.String();
      res.blocks.should.be.an.Array();
      res.blocks.length.should.be.greaterThan(0);

      res.blocks.forEach(textBlock => {
        textBaseElementValidate(textBlock, true);
        textBlock.lines.should.be.an.Array();
        textBlock.lines.length.should.be.greaterThan(0);
        textBlock.lines.forEach(line => {
          textBaseElementValidate(line, true);
          line.elements.should.be.an.Array();
          line.elements.length.should.be.greaterThan(0);
          line.elements.forEach(element => {
            textBaseElementValidate(element, true);
          });
        });
      });
    });
  });
});
