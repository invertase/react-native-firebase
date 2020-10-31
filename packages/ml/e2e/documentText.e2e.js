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

function documentTextBaseElementValidate(documentTextBase) {
  // text
  documentTextBase.text.should.be.a.String();

  // confidence
  documentTextBase.confidence.should.be.a.Number();

  // bounding box
  documentTextBase.boundingBox.should.be.an.Array();
  documentTextBase.boundingBox[0].should.be.a.Number();
  documentTextBase.boundingBox[1].should.be.a.Number();
  documentTextBase.boundingBox[2].should.be.a.Number();
  documentTextBase.boundingBox[3].should.be.a.Number();

  // recognizedBreak
  if (documentTextBase.recognizedBreak != null) {
    documentTextBase.recognizedBreak.should.be.an.Object();
    documentTextBase.recognizedBreak.breakType.should.be.a.Number();
    documentTextBase.recognizedBreak.isPrefix.should.be.a.Boolean();
  }

  // recognizedLanguages
  documentTextBase.recognizedLanguages.should.be.an.Array();
}

let testImageFile;

describe('ml.document.text', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/text.png`;
    await firebase
      .storage()
      .ref('vision/text.png')
      .writeToFile(testImageFile);
  });

  describe('MLCloudDocumentTextRecognizerOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, 'foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions' expected an object value",
        );
        return Promise.resolve();
      }
    });

    it('throws if enforceCertFingerprintMatch is not a boolean', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
          enforceCertFingerprintMatch: 'true',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions.enforceCertFingerprintMatch' expected a boolean value",
        );
        return Promise.resolve();
      }
    });

    it('sets enforceCertFingerprintMatch', async () => {
      await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
        enforceCertFingerprintMatch: false,
      });
    });

    it('throws if apiKeyOverride is not a string', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
          apiKeyOverride: true,
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions.apiKeyOverride' expected a string value",
        );
        return Promise.resolve();
      }
    });

    it('throws if languageHints is not an array', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
          languageHints: 'en',
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions.languageHints' must be an non empty array of strings",
        );
        return Promise.resolve();
      }
    });

    it('throws if languageHints is empty array', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
          languageHints: [],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions.languageHints' must be an non empty array of strings",
        );
        return Promise.resolve();
      }
    });

    it('throws if languageHints contains non-string', async () => {
      try {
        await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
          languageHints: [123],
        });
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          "'cloudDocumentTextRecognizerOptions.languageHints' must be an non empty array of strings",
        );
        return Promise.resolve();
      }
    });

    it('sets hinted languages', async () => {
      await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile, {
        languageHints: ['fr'],
      });
    });
  });

  describe('cloudDocumentTextRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.ml().cloudDocumentTextRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('should return a MLDocumentText representation for an image', async () => {
      const res = await firebase.ml().cloudDocumentTextRecognizerProcessImage(testImageFile);

      res.text.should.be.a.String();
      res.blocks.should.be.an.Array();
      res.blocks.length.should.be.greaterThan(0);

      res.blocks.forEach(textBlock => {
        documentTextBaseElementValidate(textBlock);
        textBlock.paragraphs.should.be.an.Array();
        textBlock.paragraphs.length.should.be.greaterThan(0);
        textBlock.paragraphs.forEach(paragraph => {
          documentTextBaseElementValidate(paragraph);
          paragraph.words.should.be.an.Array();
          paragraph.words.length.should.be.greaterThan(0);
          paragraph.words.forEach(word => {
            documentTextBaseElementValidate(word);
            word.symbols.should.be.an.Array();
            word.symbols.length.should.be.greaterThan(0);
            word.symbols.forEach(symbol => {
              documentTextBaseElementValidate(symbol);
            });
          });
        });
      });
    });
  });
});
