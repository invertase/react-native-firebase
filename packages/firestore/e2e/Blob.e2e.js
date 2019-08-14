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

const testObject = { hello: 'world' };
const testString = JSON.stringify(testObject);
const testBuffer = Buffer.from(testString);
const testBase64 = testBuffer.toString('base64');

const testObjectLarge = new Array(5000).fill(testObject);
const testStringLarge = JSON.stringify(testObjectLarge);
const testBufferLarge = Buffer.from(testStringLarge);
const testBase64Large = testBufferLarge.toString('base64');

describe('firestore.Blob', () => {
  it('should throw if constructed manually', () => {
    try {
      new firebase.firestore.Blob();
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql('constructor is private');
      return Promise.resolve();
    }
  });

  it('should be exported as a static', () => {
    const { Blob } = firebase.firestore;
    should.exist(Blob);
  });

  it('.fromBase64String() -> returns new instance of Blob', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    myBlob.should.be.instanceOf(Blob);
    myBlob._binaryString.should.equal(testString);
    should.deepEqual(
      JSON.parse(myBlob._binaryString),
      testObject,
      'Expected Blob _binaryString internals to serialize to json and match test object',
    );
  });

  it('.fromBase64String() -> throws if arg not typeof string and length > 0', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    myBlob.should.be.instanceOf(Blob);
    (() => Blob.fromBase64String(1234)).should.throwError();
    (() => Blob.fromBase64String('')).should.throwError();
  });

  it('.fromUint8Array() -> returns new instance of Blob', async () => {
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromUint8Array(testUInt8Array);
    myBlob.should.be.instanceOf(Blob);
    const json = JSON.parse(myBlob._binaryString);
    json.hello.should.equal('world');
  });

  it('.fromUint8Array() -> throws if arg not instanceof Uint8Array', async () => {
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromUint8Array(testUInt8Array);
    myBlob.should.be.instanceOf(Blob);
    (() => Blob.fromUint8Array('derp')).should.throwError();
  });

  it('.toString() -> returns string representation of blob instance', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    myBlob.should.be.instanceOf(Blob);
    should.equal(
      myBlob.toString().includes(testBase64),
      true,
      'toString() should return a string that includes the base64',
    );
  });

  it('.isEqual() -> returns true or false', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    const myBlob2 = Blob.fromBase64String(testBase64Large);
    myBlob.isEqual(myBlob).should.equal(true);
    myBlob2.isEqual(myBlob).should.equal(false);
  });

  it('.isEqual() -> throws if arg not instanceof Blob', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    const myBlob2 = Blob.fromBase64String(testBase64Large);
    myBlob.isEqual(myBlob).should.equal(true);
    (() => myBlob2.isEqual('derp')).should.throwError();
  });

  it('.toBase64() -> returns base64 string', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    myBlob.should.be.instanceOf(Blob);
    myBlob.toBase64().should.equal(testBase64);
  });

  it('.toUint8Array() -> returns Uint8Array', async () => {
    const { Blob } = firebase.firestore;
    const myBlob = Blob.fromBase64String(testBase64);
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const testUInt8Array2 = new jet.context.window.Uint8Array();

    myBlob.should.be.instanceOf(Blob);
    should.deepEqual(myBlob.toUint8Array(), testUInt8Array);
    should.notDeepEqual(myBlob.toUint8Array(), testUInt8Array2);
  });
});
