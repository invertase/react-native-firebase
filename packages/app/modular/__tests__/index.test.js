import { deleteApp, getApps } from '../src';
import * as impl from '../src/impl';

jest.mock('../src/impl');

describe('app', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    impl.getApps.mockReturnValueOnce([]);
    impl.deleteApp.mockResolvedValue();
  });

  describe('deleteApp', () => {
    test('throws if an invalid app is provided', () => {
      expect(deleteApp).toThrowError(/is not a FirebaseApp/);
      expect(() => deleteApp('foo')).toThrowError(/is not a FirebaseApp/);
      expect(() => deleteApp(123)).toThrowError(/is not a FirebaseApp/);
      expect(() => deleteApp({})).toThrowError(/is not a FirebaseApp/);
      expect(() =>
        deleteApp({
          name: 'foo',
        }),
      ).toThrowError(/is not a FirebaseApp/);
    });

    test('it calls the implementation and returns a promise', async () => {
      await expect(() => deleteApp({ name: 'foo', options: {} })).resolves.toBeUndefined();
    });
  });

  describe('getApps', () => {
    test('it calls the implementation and returns a value', () => {
      impl.getApps.mockReturnValueOnce([]);
      const apps = getApps();
      expect(impl.getApps.mock.calls).toHaveLength(1);
      expect(apps).toEqual([]);
    });
  });
});
