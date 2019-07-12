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

describe('mlkit.vision.document.text', () => {
  before(async () => {
    testImageFile = `${firebase.storage.Path.DocumentDirectory}/text.png`;
    await firebase
      .storage()
      .ref('vision/text.png')
      .getFile(testImageFile);
  });

  describe('VisionCloudDocumentTextRecognizerOptions', () => {
    it('enforceCertFingerprintMatch()', () => {
      const o = new firebase.mlKitVision.VisionCloudDocumentTextRecognizerOptions();
      o.enforceCertFingerprintMatch();
      o.get('enforceCertFingerprintMatch').should.equal(true);
    });

    it('setLanguageHints()', () => {
      const o = new firebase.mlKitVision.VisionCloudDocumentTextRecognizerOptions();
      o.setLanguageHints(['en']);
      o.get('hintedLanguages').should.be.an.Array();
      o.get('hintedLanguages')[0].should.equal('en');
    });

    it('setLanguageHints() - throws if not an array', () => {
      const o = new firebase.mlKitVision.VisionCloudDocumentTextRecognizerOptions();
      try {
        o.setLanguageHints('invertase');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });

    it('setLanguageHints() - throws if empty array', () => {
      const o = new firebase.mlKitVision.VisionCloudDocumentTextRecognizerOptions();
      try {
        o.setLanguageHints([]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });

    it('setLanguageHints() - throws array not strings', () => {
      const o = new firebase.mlKitVision.VisionCloudDocumentTextRecognizerOptions();
      try {
        o.setLanguageHints([1, 2, 3]);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'hintedLanguages' must be an non empty array of strings.`);
        return Promise.resolve();
      }
    });
  });

  describe('cloudDocumentTextRecognizerProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.mlKitVision().cloudDocumentTextRecognizerProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(`'localImageFilePath' expected a string local file path`);
        return Promise.resolve();
      }
    });

    it('should throw if options are not a valid instance', () => {
      try {
        firebase.mlKitVision().cloudDocumentTextRecognizerProcessImage('invertase', {});
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql(
          `'cloudDocumentTextRecognizerOptions' expected an instance of VisionCloudDocumentTextRecognizerOptions`,
        );
        return Promise.resolve();
      }
    });

    it('should return a VisionDocumentText representation for an image', async () => {
      const res = await firebase
        .mlKitVision()
        .cloudDocumentTextRecognizerProcessImage(testImageFile);

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
