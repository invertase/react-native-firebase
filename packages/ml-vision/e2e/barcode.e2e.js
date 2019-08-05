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

function barcodeValidate(barcode) {
  barcode.should.be.Object();

  barcode.boundingBox.should.be.Array();
  barcode.boundingBox.length.should.eql(4);
  barcode.boundingBox.forEach($ => $.should.be.Number());

  barcode.cornerPoints.should.be.Array();
  barcode.cornerPoints.length.should.eql(4);
  barcode.cornerPoints.forEach($ => {
    $.should.be.Array();
    $.length.should.eql(2);
    $.forEach(_ => _.should.be.Number());
  });

  barcode.format.should.be.Number();
  barcode.valueType.should.be.Number();

  barcode.displayValue.should.be.String();
  barcode.rawValue.should.be.String();
}

android.describe('mlkit.vision.barcode', () => {
  before(async () => {
    testImageFile = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/barcode.png`;
    await firebase
      .storage()
      .ref('vision/barcode.png')
      .writeToFile(testImageFile);
  });

  describe('barcodeDetectorProcessImage()', () => {
    it('should throw if image path is not a string', () => {
      try {
        firebase.vision().barcodeDetectorProcessImage(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'localImageFilePath' expected a string local file path");
        return Promise.resolve();
      }
    });

    it('should return a valid response', async () => {
      const res = await firebase.vision().barcodeDetectorProcessImage(testImageFile);

      res.should.be.Array();
      res.length.should.be.greaterThan(0);
      res.forEach($ => barcodeValidate($));
    });
  });

  describe('VisionBarcodeDetectorOptions', () => {
    it('throws if not an object', async () => {
      try {
        await firebase.vision().barcodeDetectorProcessImage(testImageFile, '123');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (error) {
        error.message.should.containEql("'barcodeDetectorOptions' expected an object value");
        return Promise.resolve();
      }
    });

    describe('barcodeFormats', () => {
      it('should throw if not an array', async () => {
        try {
          await firebase.vision().barcodeDetectorProcessImage(testImageFile, {
            barcodeFormats: 'foo',
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'barcodeDetectorOptions.barcodeFormats' must be an array of VisionBarcodeFormat types",
          );
          return Promise.resolve();
        }
      });

      it('should throw if array item is invalid type', async () => {
        try {
          await firebase.vision().barcodeDetectorProcessImage(testImageFile, {
            barcodeFormats: [firebase.vision.VisionBarcodeFormat.AZTEC, 'foobar'],
          });
          return Promise.reject(new Error('Did not throw an Error.'));
        } catch (error) {
          error.message.should.containEql(
            "'barcodeDetectorOptions.barcodeFormats' type at index 1 is invalid",
          );
          return Promise.resolve();
        }
      });

      it('sets formats', async () => {
        await firebase.vision().barcodeDetectorProcessImage(testImageFile, {
          barcodeFormats: [
            firebase.vision.VisionBarcodeFormat.AZTEC,
            firebase.vision.VisionBarcodeFormat.DATA_MATRIX,
          ],
        });
      });
    });
  });
});
