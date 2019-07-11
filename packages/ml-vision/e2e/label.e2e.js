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

describe.only('mlkit.label', () => {
  it('test local', async () => {
    const downloadTo = `${firebase.storage.Path.DocumentDirectory}/crab.jpg`;
    await firebase
      .storage()
      .ref('vision/crab.jpg')
      .getFile(downloadTo);

    const res = await firebase.mlKitVision().imageLabelerProcessImage(downloadTo);

    res.should.be.Array();
    res.length.should.be.greaterThan(0);

    res.forEach(i => {
      i.text.should.be.String();
      i.entityId.should.be.String();
      i.confidence.should.be.Number();
    });
  });

  it('test cloud', async () => {
    const downloadTo = `${firebase.storage.Path.DocumentDirectory}/crab.jpg`;
    await firebase
      .storage()
      .ref('vision/crab.jpg')
      .getFile(downloadTo);

    const res = await firebase.mlKitVision().cloudImageLabelerProcessImage(downloadTo);

    res.should.be.Array();
    res.length.should.be.greaterThan(0);

    res.forEach(i => {
      i.text.should.be.String();
      i.entityId.should.be.String();
      i.confidence.should.be.Number();
    });
  });
});
