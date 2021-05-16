import firestore, { firebase } from '../lib';

const COLLECTION = 'firestore';

describe('Storage', function () {
  describe('namespace', function () {
    it('accessible from firebase.app()', function () {
      const app = firebase.app();
      expect(app.firestore).toBeDefined();
      expect(app.firestore().settings).toBeDefined();
    });
  });

  describe('batch()', function () {
    it('returns a new WriteBatch instance', function () {
      const instance = firebase.firestore().batch();
      return expect(instance.constructor.name).toEqual('FirestoreWriteBatch');
    });
  });

  describe('settings', function () {
    it('throws if settings is not an object', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings' must be an object");
      }
    });

    it('throws if passing an incorrect setting key', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ foo: 'bar' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.foo' is not a valid settings field");
      }
    });

    it('throws if cacheSizeBytes is not a number', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ cacheSizeBytes: 'foo' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.cacheSizeBytes' must be a number value");
      }
    });

    it('throws if cacheSizeBytes is less than 1MB', async function () {
      try {
        await firebase.firestore().settings({ cacheSizeBytes: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.cacheSizeBytes' the minimum cache size");
      }
    });

    it('accepts an unlimited cache size', async function () {
      await firebase
        .firestore()
        .settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
    });

    it('throws if host is not a string', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ host: 123 });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.host' must be a string value");
      }
    });

    it('throws if host is an empty string', async function () {
      try {
        await firebase.firestore().settings({ host: '' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.host' must not be an empty string");
      }
    });

    it('throws if persistence is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ persistence: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.persistence' must be a boolean value");
      }
    });

    it('throws if ssl is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().settings({ ssl: 'true' });
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'settings.ssl' must be a boolean value");
      }
    });

    it('throws if ignoreUndefinedProperties is not a boolean', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firestore().settings({ ignoreUndefinedProperties: 'bogus' });
        return Promise.reject(new Error('Should throw'));
      } catch (e) {
        return expect(e.message).toContain("ignoreUndefinedProperties' must be a boolean value.");
      }
    });
  });

  describe('runTransaction()', function () {
    it('throws if updateFunction is not a function', async function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        await firebase.firestore().runTransaction('foo');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'updateFunction' must be a function");
      }
    });
  });

  describe('collectionGroup()', function () {
    it('returns a new query instance', function () {
      const query = firebase.firestore().collectionGroup(COLLECTION);
      expect(query.constructor.name).toEqual('FirestoreQuery');
    });

    it('throws if id is not a string', function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().collectionGroup(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionId' must be a string value");
      }
    });

    it('throws if id is empty', function () {
      try {
        firebase.firestore().collectionGroup('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionId' must be a non-empty string");
      }
    });

    it('throws if id contains forward-slash', function () {
      try {
        firebase.firestore().collectionGroup(`someCollection/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionId' must not contain '/'");
      }
    });
  });

  describe('collection()', function () {
    it('throws if path is not a string', function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().collection(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionPath' must be a string value");
      }
    });

    it('throws if path is empty string', function () {
      try {
        firebase.firestore().collection('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionPath' must be a non-empty string");
      }
    });

    it('throws if path does not point to a collection', function () {
      try {
        firebase.firestore().collection(`firestore/bar`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'collectionPath' must point to a collection");
      }
    });

    it('returns a new CollectionReference', function () {
      const collectionReference = firebase.firestore().collection('firestore');
      expect(collectionReference.constructor.name).toEqual('FirestoreCollectionReference');
      expect(collectionReference.path).toEqual('firestore');
    });
  });

  describe('doc()', function () {
    it('throws if path is not a string', function () {
      try {
        // @ts-ignore the type is incorrect *on purpose* to test type checking in javascript
        firebase.firestore().doc(123);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'documentPath' must be a string value");
      }
    });

    it('throws if path is empty string', function () {
      try {
        firebase.firestore().doc('');
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'documentPath' must be a non-empty string");
      }
    });

    it('throws if path does not point to a document', function () {
      try {
        firebase.firestore().doc(`${COLLECTION}/bar/baz`);
        return Promise.reject(new Error('Did not throw an Error.'));
      } catch (e) {
        return expect(e.message).toContain("'documentPath' must point to a document");
      }
    });

    it('returns a new DocumentReference', function () {
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      expect(docRef.constructor.name).toEqual('FirestoreDocumentReference');
      expect(docRef.path).toEqual(`${COLLECTION}/bar`);
    });

    it('throws when undefined value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      try {
        await docRef.set({
          field1: 1,
          field2: undefined,
        });

        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e) {
        return expect(e.message).toEqual('Unsupported field value: undefined');
      }
    });

    it('throws when nested undefined value provided and ignored undefined is false', async function () {
      await firebase.firestore().settings({ ignoreUndefinedProperties: false });
      const docRef = firebase.firestore().doc(`${COLLECTION}/bar`);
      try {
        await docRef.set({
          field1: 1,
          field2: {
            shouldNotWork: undefined,
          },
        });
        return Promise.reject(new Error('Expected set() to throw'));
      } catch (e) {
        return expect(e.message).toEqual('Unsupported field value: undefined');
      }
    });
  });
});
