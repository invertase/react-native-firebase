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

android.describe('mlkit.vision.text', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/text.png`;
    await firebase
      .storage()
      .ref('vision/text.png')
      .writeToFile(testImageFile);
  });
  describe('textRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().textRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
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
    it('throws if not an object', async () => {
      try {
        await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'cloudTextRecognizerOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('enforceCertFingerprintMatch', () => {
      it('throws if not a boolean', async () => {
        try {
          await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
            enforceCertFingerprintMatch: 'false',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudTextRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value",
          );
          return Promise.resolve();
        }
      });

      it('sets a value', async () => {
        await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
          enforceCertFingerprintMatch: false,
        });
      });
    });

    describe('languageHints', () => {
      it('throws if not array', async () => {
        try {
          await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
            languageHints: 'en',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudTextRecognizerOptions.languageHints' must be an non empty array of strings",
          );
          return Promise.resolve();
        }
      });

      it('throws if empty array', async () => {
        try {
          await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
            languageHints: [],
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudTextRecognizerOptions.languageHints' must be an non empty array of strings",
          );
          return Promise.resolve();
        }
      });

      it('throws if array contains non-string values', async () => {
        try {
          await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
            languageHints: [123],
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'cloudTextRecognizerOptions.languageHints' must be an non empty array of strings",
          );
          return Promise.resolve();
        }
      });

      it('sets hintedLanguages', async () => {
        await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
          languageHints: ['fr'],
        });
      });
    });

    describe('modelType', () => {
      it('throws if invalid type', async () => {
        try {
          await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
            modelType: 7,
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql("'cloudTextRecognizerOptions.modelType' invalid model");
          return Promise.resolve();
        }
      });

      it('sets modelType', async () => {
        await firebase.mlKitVision().cloudTextRecognizerProcessImage(testImageFile, {
          modelType: firebase.mlKitVision.VisionCloudTextRecognizerModelType.SPARSE_MODEL,
        });

        await firebase.mlKitVision().textRecognizerProcessImage(testImageFile, {
          modelType: firebase.mlKitVision.VisionCloudTextRecognizerModelType.DENSE_MODEL,
        });
      });
    });
  });

  describe('cloudTextRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().cloudTextRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
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
