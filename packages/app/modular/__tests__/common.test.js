import {
  stripTrailingSlash,
  eventNameForApp,
  FirebaseError,
  guard,
  ArgumentError,
  pathParsed,
  pathPieces,
  pathParent,
  pathLastComponent,
  pathJoin,
  pathKey,
  toBase64String,
  dataUrlParts,
} from '../src/internal';
import { createFirebaseApp } from './helpers';

describe('common', () => {
  describe('stripTrailingSlash', () => {
    test('it returns a string value with no trailing slash', () => {
      expect(stripTrailingSlash('foo')).toBe('foo');
      expect(stripTrailingSlash('/foo')).toBe('/foo');
      expect(stripTrailingSlash('/foo/bar')).toBe('/foo/bar');
      expect(stripTrailingSlash('foo/')).toBe('foo');
      expect(stripTrailingSlash('foo/bar/')).toBe('foo/bar');
    });
  });

  describe('eventNameForApp', () => {
    test('it returns the correct event name', () => {
      const defaultApp = createFirebaseApp();
      const secondaryApp = createFirebaseApp('baz');
      expect(eventNameForApp(defaultApp, 'foo')).toBe(`${defaultApp.name}-foo`);
      expect(eventNameForApp(secondaryApp, 'bar')).toBe(`${secondaryApp.name}-bar`);
    });

    test('accepts multiple string arguments', () => {
      const secondaryApp = createFirebaseApp('baz');
      expect(eventNameForApp(secondaryApp, 'bar', 'baz')).toBe(`${secondaryApp.name}-bar-baz`);
      expect(eventNameForApp(secondaryApp, 'bar', 'baz', '!!!')).toBe(
        `${secondaryApp.name}-bar-baz-!!!`,
      );
    });
  });

  describe('FirebaseError', () => {
    test('it creates a code property', () => {
      const e = new Error('foo');
      const error = new FirebaseError(e, 'bar');
      expect(error).toHaveProperty('code');
      expect(error.code).toBe('bar/unknown');
    });

    test('it overrides the message with the code', () => {
      const e = new Error('foo');
      const error = new FirebaseError(e, 'bar');

      expect(error).toHaveProperty('message');
      expect(error.message).toBe('foo (bar/unknown)');
    });

    test('it can provide a custom code', () => {
      const e = new Error('foo');
      const error = new FirebaseError(e, 'bar', 'baz');

      expect(error).toHaveProperty('code');
      expect(error.code).toBe('bar/baz');
      expect(error).toHaveProperty('message');
      expect(error.message).toBe('foo (bar/baz)');
    });
  });

  describe('guard', () => {
    test('it converts a generic error with a valid code to a FirebaseError', async () => {
      const error = new Error('foo');
      error.code = 'test/unknown';

      const promise = new Promise((_, reject) => {
        return reject(error);
      });

      expect.assertions(3);

      return guard(promise).catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e).toHaveProperty('code');
        expect(e.code).toBe('test/unknown');
      });
    });

    test('throws an error with a non string based code', async () => {
      const error = new Error('foo');

      const promise = new Promise(async (_, reject) => {
        return reject(error);
      });

      await expect(() => guard(promise)).rejects.toThrow();
    });
  });

  describe('ArgumentError', () => {
    test('it creates an argument property', () => {
      const error = new ArgumentError('foo');
      expect(error).toHaveProperty('argument');
      expect(error.argument).toBe('foo');
    });

    test('it creates a message from the argument', () => {
      const error = new ArgumentError('bar');
      expect(error).toHaveProperty('message');
      expect(error.message).toBe(`Invalid argument 'bar'.`);
    });

    test('it appends a custom message', () => {
      const customMessage = 'Some custom message';
      const error = new ArgumentError('bar', customMessage);
      expect(error).toHaveProperty('message');
      expect(error.message).toBe(`Invalid argument 'bar'. ${customMessage}.`);
    });
  });

  describe('pathParsed', () => {
    test('it removes forward and trailing slashes', () => {
      expect(pathParsed('/test/')).toBe(`test`);
    });

    test('it defaults to a single slash', () => {
      expect(pathParsed('')).toBe(`/`);
    });
  });

  describe('pathPieces', () => {
    test('it returns a correct number of parts', () => {
      expect(pathPieces('/foo/bar/')[0]).toBe('foo');
      expect(pathPieces('/foo/bar/')[1]).toBe('bar');
      expect(pathPieces('/foo/bar/')).toHaveLength(2);
    });
  });

  describe('pathParent', () => {
    test('it returns null from a single path', () => {
      expect(pathParent('/')).toBeNull();
    });

    test('it returns the path parent', () => {
      expect(pathParent('/one/two/three')).toBe('one/two');
    });

    test('it returns null if no child exists', () => {
      expect(pathParent('/one/')).toBeNull();
    });
  });

  describe('pathLastComponent', () => {
    test('it returns empty string from a single path', () => {
      expect(pathLastComponent('/')).toBe('');
    });

    test('it returns the last component', () => {
      expect(pathLastComponent('/one/two/three')).toBe('three');
    });

    test('it returns child string if no parent exists', () => {
      expect(pathLastComponent('/one/')).toBe('one');
    });
  });

  describe('pathJoin', () => {
    test('it returns a combined path', () => {
      expect(pathJoin('one/two', 'three/four')).toBe('one/two/three/four');
    });

    test('it returns child parent from single parent path', () => {
      expect(pathJoin('/', 'three/four')).toBe('three/four');
    });
  });

  describe('pathKey', () => {
    test('it returns a path key', () => {
      expect(pathKey('one/two/three/four')).toBe('four');
    });

    test('it returns null from a default parent path', () => {
      expect(pathKey('/')).toBeNull();
    });
  });

  describe('toBase64String', () => {
    test('it converts a blob', () => {
      var testBlob = new Blob(['test text'], { type: 'text/plain' });

      return toBase64String(testBlob).then(({ value, format }) => {
        expect(value).toBe('data:text/plain;base64,dGVzdCB0ZXh0');
        expect(format).toBe('data_url');
      });
    });

    // test('it throws an error on an invalid blob value', async () => {
    //   const file = new Blob(['a'.repeat(10)], { type: 'application/pdf' });

    //   await expect(() => toBase64String(file)).rejects.toThrow(
    //     'FileReader failed to parse Blob value.',
    //   );
    // });

    test('it converts an array buffer', () => {
      var testBuffer = new Uint8Array([11, 22, 33]);

      return toBase64String(testBuffer).then(({ value, format }) => {
        expect(value).toBe('CxYh');
        expect(format).toBe('base64');
      });
    });

    test('it throws an error with an unsupported type', async () => {
      await expect(() => toBase64String()).toThrow('toBase64String: unexpected value provided');
    });
  });

  describe('dataUrlParts', () => {
    test('it returns undefined if no media type included', () => {
      const url = 'SGVsbG8sIFdvcmxkIQ==';

      expect(dataUrlParts(url)).toEqual([undefined, undefined]);
    });

    test('it returns undefined if no base64 value included', () => {
      const url = 'data:text/plain;base64,';

      expect(dataUrlParts(url)).toEqual([undefined, undefined]);
    });

    test('it returns parts from base64 string', () => {
      const url = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';

      const [base64String, mediaType] = dataUrlParts(url);

      expect(base64String).toBe('SGVsbG8sIFdvcmxkIQ==');
      expect(mediaType).toBe('text/plain');
    });

    test('it returns parts from encoded base64 string', () => {
      const url = 'data:text/html,%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E';

      const [base64String, mediaType] = dataUrlParts(url);

      expect(base64String).toBe('PGgxPkhlbGxvLCBXb3JsZCE8L2gxPg==');
      expect(mediaType).toBe('text/html');
    });
  });
});
