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

describe.only('mlkit.face', () => {
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

    it('sdf', async () => {
      await Utils.sleep(3000);
      const downloadTo = `${firebase.storage.Path.DocumentDirectory}/faces.jpg`;
      await firebase
        .storage()
        .ref('vision/faces.jpg')
        .getFile(downloadTo);

      const res = await firebase.mlKitVision().faceDetectorProcessImage(downloadTo);

      console.log(res);
    });
  });
});
