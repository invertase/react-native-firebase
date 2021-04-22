import { stripTrailingSlash, eventNameForApp, FirebaseError, ArgumentError } from '../src/common';
import { createFirebaseApp } from './utils';

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
});
