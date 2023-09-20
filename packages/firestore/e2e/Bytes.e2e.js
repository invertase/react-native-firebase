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

describe('Bytes modular', function () {
  it('.fromBase64String() -> returns new instance of Bytes', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    myBytes.should.be.instanceOf(Bytes);
    myBytes._blob.should.be.instanceOf(firebase.firestore.Blob);
    myBytes._blob._binaryString.should.equal(testString);
    should.deepEqual(
      JSON.parse(myBytes._blob._binaryString),
      testObject,
      'Expected Blob _binaryString internals to serialize to json and match test object',
    );
  });

  it('.fromBase64String() -> throws if arg not typeof string and length > 0', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    myBytes.should.be.instanceOf(Bytes);
    (() => Bytes.fromBase64String(1234)).should.throwError();
    (() => Bytes.fromBase64String('')).should.throwError();
  });

  it('.fromUint8Array() -> returns new instance of Bytes', async function () {
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromUint8Array(testUInt8Array);
    myBytes.should.be.instanceOf(Bytes);
    const json = JSON.parse(myBytes._blob._binaryString);
    json.hello.should.equal('world');
  });

  it('.fromUint8Array() -> throws if arg not instanceof Uint8Array', async function () {
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromUint8Array(testUInt8Array);
    myBytes.should.be.instanceOf(Bytes);
    (() => Bytes.fromUint8Array('derp')).should.throwError();
  });

  it('.toString() -> returns string representation of bytes instance', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    myBytes.should.be.instanceOf(Bytes);
    should.equal(
      myBytes.toString().includes(testBase64),
      true,
      'toString() should return a string that includes the base64',
    );
  });

  it('.isEqual() -> returns true or false', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    const myBytes2 = Bytes.fromBase64String(testBase64Large);
    myBytes.isEqual(myBytes).should.equal(true);
    myBytes2.isEqual(myBytes).should.equal(false);
  });

  it('.isEqual() -> throws if arg not instanceof Bytes', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    const myBytes2 = Bytes.fromBase64String(testBase64Large);
    myBytes.isEqual(myBytes).should.equal(true);
    (() => myBytes2.isEqual('derp')).should.throwError();
  });

  it('.toBase64() -> returns base64 string', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    myBytes.should.be.instanceOf(Bytes);
    myBytes.toBase64().should.equal(testBase64);
  });

  it('.toUint8Array() -> returns Uint8Array', async function () {
    const { Bytes } = firestoreModular;
    const myBytes = Bytes.fromBase64String(testBase64);
    const testUInt8Array = new jet.context.window.Uint8Array(testBuffer);
    const testUInt8Array2 = new jet.context.window.Uint8Array();

    myBytes.should.be.instanceOf(Bytes);
    should.deepEqual(myBytes.toUint8Array(), testUInt8Array);
    should.notDeepEqual(myBytes.toUint8Array(), testUInt8Array2);
  });
});
