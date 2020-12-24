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

describe('storage() -> StorageReference', function () {
  describe('toString()', function () {
    it('returns the correct bucket path to the file', function () {
      const app = firebase.app();
      firebase
        .storage()
        .ref('/uploadNope.jpeg')
        .toString()
        .should.equal(`gs://${app.options.storageBucket}/uploadNope.jpeg`);
    });
  });

  describe('properties', function () {
    describe('fullPath', function () {
      it('returns the full path as a string', function () {
        firebase.storage().ref('/foo/uploadNope.jpeg').fullPath.should.equal('foo/uploadNope.jpeg');
        firebase.storage().ref('foo/uploadNope.jpeg').fullPath.should.equal('foo/uploadNope.jpeg');
      });
    });

    describe('storage', function () {
      it('returns the instance of storage', function () {
        firebase.storage().ref('/foo/uploadNope.jpeg').storage.ref.should.be.a.Function();
      });
    });

    describe('bucket', function () {
      it('returns the storage bucket as a string', function () {
        const app = firebase.app();
        firebase
          .storage()
          .ref('/foo/uploadNope.jpeg')
          .bucket.should.equal(app.options.storageBucket);
      });
    });

    describe('name', function () {
      it('returns the file name as a string', function () {
        const ref = firebase.storage().ref('/foo/uploadNope.jpeg');
        ref.name.should.equal('uploadNope.jpeg');
      });
    });

    describe('parent', function () {
      it('returns the parent directory as a reference', function () {
        firebase.storage().ref('/foo/uploadNope.jpeg').parent.fullPath.should.equal('foo');
      });

      it('returns null if already at root', function () {
        const ref = firebase.storage().ref('/');
        should.equal(ref.parent, null);
      });
    });

    describe('root', function () {
      it('returns a reference to the root of the bucket', function () {
        firebase.storage().ref('/foo/uploadNope.jpeg').root.fullPath.should.equal('/');
      });
    });
  });

  describe('child()', function () {
    it('returns a reference to a child path', function () {
      const parentRef = firebase.storage().ref('/foo');
      const childRef = parentRef.child('someFile.json');
      childRef.fullPath.should.equal('foo/someFile.json');
    });
  });

  describe('delete()', function () {
    before(async function () {
      await firebase
        .storage()
        .ref('/ok.jpeg')
        .writeToFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/deleteMe.jpeg`);
      await firebase
        .storage()
        .ref('/deleteMe.jpeg')
        .putFile(`${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/deleteMe.jpeg`);
    });

    it('should delete a file', async function () {
      const storageReference = firebase.storage().ref('/deleteMe.jpeg');
      await storageReference.delete();

      try {
        await storageReference.getMetadata();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if file does not exist', async function () {
      const storageReference = firebase.storage().ref('/iDoNotExist.jpeg');

      try {
        await storageReference.delete();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if no write permission', async function () {
      const storageReference = firebase.storage().ref('/uploadNope.jpeg');

      try {
        await storageReference.delete();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.should.equal(
          '[storage/unauthorized] User is not authorized to perform the desired action.',
        );
        return Promise.resolve();
      }
    });
  });

  describe('getDownloadURL', function () {
    it('should return a download url for a file', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      const downloadUrl = await storageReference.getDownloadURL();
      downloadUrl.should.be.a.String();
      downloadUrl.should.containEql('/ok.jpeg');
      downloadUrl.should.containEql(firebase.app().options.projectId);
    });

    it('throws error if file does not exist', async function () {
      const storageReference = firebase.storage().ref('/iDoNotExist.jpeg');

      try {
        await storageReference.getDownloadURL();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/object-not-found');
        error.message.should.equal(
          '[storage/object-not-found] No object exists at the desired reference.',
        );
        return Promise.resolve();
      }
    });

    it('throws error if no write permission', async function () {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');

      try {
        await storageReference.getDownloadURL();
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.should.equal(
          '[storage/unauthorized] User is not authorized to perform the desired action.',
        );
        return Promise.resolve();
      }
    });
  });

  describe('getMetadata', function () {
    it('should return a metadata for a file', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      const metadata = await storageReference.getMetadata();
      metadata.generation.should.be.a.String();
      metadata.fullPath.should.equal('ok.jpeg');
      metadata.name.should.equal('ok.jpeg');
      metadata.size.should.be.a.Number();
      should.equal(metadata.size > 0, true);
      metadata.updated.should.be.a.String();
      metadata.timeCreated.should.be.a.String();
      metadata.contentEncoding.should.be.a.String();
      metadata.contentDisposition.should.be.a.String();
      metadata.contentType.should.equal('image/jpeg');
      metadata.bucket.should.equal(`${firebase.app().options.projectId}.appspot.com`);
      metadata.metageneration.should.be.a.String();
      metadata.md5Hash.should.be.a.String();
      should.equal(metadata.cacheControl, null);
      should.equal(metadata.contentLanguage, null);
      should.equal(metadata.customMetadata, null);
    });
  });

  describe('list', function () {
    it('should return list results', async function () {
      const storageReference = firebase.storage().ref('/list');
      const result = await storageReference.list();

      result.constructor.name.should.eql('StorageListResult');
      result.should.have.property('nextPageToken');

      result.items.should.be.Array();
      result.items.length.should.be.greaterThan(0);
      result.items[0].constructor.name.should.eql('StorageReference');

      result.prefixes.should.be.Array();
      result.prefixes.length.should.be.greaterThan(0);
      result.prefixes[0].constructor.name.should.eql('StorageReference');
    });

    it('throws if options is not an object', function () {
      try {
        const storageReference = firebase.storage().ref('/');
        storageReference.list(123);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql("'options' expected an object value");
        return Promise.resolve();
      }
    });

    describe('maxResults', function () {
      it('should limit with maxResults are passed', async function () {
        const storageReference = firebase.storage().ref('/list');
        const result = await storageReference.list({
          maxResults: 1,
        });

        result.nextPageToken.should.be.String();

        result.items.should.be.Array();
        result.items.length.should.eql(1);
        result.items[0].constructor.name.should.eql('StorageReference');

        result.prefixes.should.be.Array();
        // todo length?
      });

      it('throws if maxResults is not a number', function () {
        try {
          const storageReference = firebase.storage().ref('/list');
          storageReference.list({
            maxResults: '123',
          });
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql("'options.maxResults' expected a number value");
          return Promise.resolve();
        }
      });

      it('throws if maxResults is not a valid number', function () {
        try {
          const storageReference = firebase.storage().ref('/list');
          storageReference.list({
            maxResults: 2000,
          });
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql(
            "'options.maxResults' expected a number value between 1-1000",
          );
          return Promise.resolve();
        }
      });
    });

    describe('pageToken', function () {
      it('throws if pageToken is not a string', function () {
        try {
          const storageReference = firebase.storage().ref('/list');
          storageReference.list({
            pageToken: 123,
          });
          return Promise.reject(new Error('Did not throw'));
        } catch (error) {
          error.message.should.containEql("'options.pageToken' expected a string value");
          return Promise.resolve();
        }
      });

      it('should return and use a page token', async function () {
        const storageReference = firebase.storage().ref('/list');
        const result1 = await storageReference.list({
          maxResults: 1,
        });

        const item1 = result1.items[0].fullPath;

        const result2 = await storageReference.list({
          maxResults: 1,
          pageToken: result1.nextPageToken,
        });

        const item2 = result2.items[0].fullPath;

        if (item1 === item2) {
          throw new Error('Expected item results to be different.');
        }
      });
    });
  });

  describe('listAll', function () {
    it('should return all results', async function () {
      const storageReference = firebase.storage().ref('/list');
      const result = await storageReference.listAll();

      should.equal(result.nextPageToken, null);

      result.items.should.be.Array();
      result.items.length.should.be.greaterThan(0);
      result.items[0].constructor.name.should.eql('StorageReference');

      result.prefixes.should.be.Array();
      result.prefixes.length.should.be.greaterThan(0);
      result.prefixes[0].constructor.name.should.eql('StorageReference');
    });

    it('should not crash if the user is not allowed to list the directory', async function () {
      const storageReference = firebase.storage().ref('/forbidden');
      try {
        await storageReference.listAll();
        return Promise.reject(new Error('listAll on a forbidden directory succeeded'));
      } catch (error) {
        error.code.should.equal('storage/unauthorized');
        error.message.should.equal(
          '[storage/unauthorized] User is not authorized to perform the desired action.',
        );
        return Promise.resolve();
      }
    });
  });

  describe('updateMetadata', function () {
    it('should return the updated metadata for a file', async function () {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');
      const metadata = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          hello: 'world',
        },
      });

      metadata.customMetadata.hello.should.equal('world');
      metadata.generation.should.be.a.String();
      metadata.fullPath.should.equal('writeOnly.jpeg');
      metadata.name.should.equal('writeOnly.jpeg');
      metadata.size.should.be.a.Number();
      should.equal(metadata.size > 0, true);
      metadata.updated.should.be.a.String();
      metadata.timeCreated.should.be.a.String();
      metadata.contentEncoding.should.be.a.String();
      metadata.contentDisposition.should.be.a.String();
      metadata.contentType.should.equal('image/jpeg');
      metadata.bucket.should.equal(`${firebase.app().options.projectId}.appspot.com`);
      metadata.metageneration.should.be.a.String();
      metadata.md5Hash.should.be.a.String();
      should.equal(metadata.cacheControl, null);
      should.equal(metadata.contentLanguage, null);
      metadata.customMetadata.should.be.an.Object();
    });

    it('should remove customMetadata properties by setting the value to null', async function () {
      const storageReference = firebase.storage().ref('/writeOnly.jpeg');
      const metadata = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          removeMe: 'please',
        },
      });

      metadata.customMetadata.removeMe.should.equal('please');

      const metadataAfterRemove = await storageReference.updateMetadata({
        contentType: 'image/jpeg',
        customMetadata: {
          removeMe: null,
        },
      });

      should.equal(metadataAfterRemove.customMetadata.removeMe, undefined);
    });
  });

  describe('putFile', function () {
    it('errors if file path is not a string', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putFile(1337);
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('expects a string value');
        return Promise.resolve();
      }
    });

    it('errors if metadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putFile('foo', 123);
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('must be an object value');
        return Promise.resolve();
      }
    });

    it('errors if metadata contains an unsupported property', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putFile('foo', { foo: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql("unknown property 'foo'");
        return Promise.resolve();
      }
    });

    it('errors if metadata property value is not a string or null value', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putFile('foo', { contentType: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('should be a string or null value');
        return Promise.resolve();
      }
    });

    it('errors if metadata.customMetadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putFile('foo', { customMetadata: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(
          'customMetadata must be an object of keys and string values',
        );
        return Promise.resolve();
      }
    });
  });

  describe('putString', function () {
    it('errors if metadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putString('foo', 'raw', 123);
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('must be an object value');
        return Promise.resolve();
      }
    });

    it('errors if metadata contains an unsupported property', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putString('foo', 'raw', { foo: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql("unknown property 'foo'");
        return Promise.resolve();
      }
    });

    it('errors if metadata property value is not a string or null value', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putString('foo', 'raw', { contentType: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('should be a string or null value');
        return Promise.resolve();
      }
    });

    it('errors if metadata.customMetadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.putString('foo', 'raw', { customMetadata: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(
          'customMetadata must be an object of keys and string values',
        );
        return Promise.resolve();
      }
    });
  });

  describe('put', function () {
    it('errors if metadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.put(new jet.context.window.ArrayBuffer(), 123);
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('must be an object value');
        return Promise.resolve();
      }
    });

    it('errors if metadata contains an unsupported property', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.put(new jet.context.window.ArrayBuffer(), { foo: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql("unknown property 'foo'");
        return Promise.resolve();
      }
    });

    it('errors if metadata property value is not a string or null value', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.put(new jet.context.window.ArrayBuffer(), { contentType: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql('should be a string or null value');
        return Promise.resolve();
      }
    });

    it('errors if metadata.customMetadata is not an object', async function () {
      const storageReference = firebase.storage().ref('/ok.jpeg');
      try {
        storageReference.put(new jet.context.window.ArrayBuffer(), { customMetadata: true });
        return Promise.reject(new Error('Did not error!'));
      } catch (error) {
        error.message.should.containEql(
          'customMetadata must be an object of keys and string values',
        );
        return Promise.resolve();
      }
    });
  });
});
