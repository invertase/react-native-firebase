import {
  isRunningInTestLab,
  playServicesAvailability,
  getPlayServicesStatus,
  promptForPlayServices,
  makePlayServicesAvailable,
  resolutionForPlayServices,
  isFirebaseError,
} from '../src';
import { FirebaseError } from '../src/internal';
import * as impl from '../src/utils/impl';

jest.mock('../src/utils/impl');

describe('utils', () => {
  describe('isRunningInTestLab', () => {
    test('it returns a value', () => {
      expect(isRunningInTestLab).toBeDefined();
    });
  });

  describe('playServicesAvailability', () => {
    test('it returns a value', () => {
      expect(playServicesAvailability).toBeDefined();
    });
  });

  describe('getPlayServicesStatus', () => {
    test('it calls the implementation', async () => {
      impl.getPlayServicesStatus.mockResolvedValue('foo');
      const res = await getPlayServicesStatus();
      expect(res).toBe('foo');
      expect(impl.getPlayServicesStatus.mock.calls).toHaveLength(1);
      expect(impl.getPlayServicesStatus.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('promptForPlayServices', () => {
    test('it calls the implementation', async () => {
      impl.promptForPlayServices.mockResolvedValue('foo');
      const res = await promptForPlayServices();
      expect(res).toBe('foo');
      expect(impl.promptForPlayServices.mock.calls).toHaveLength(1);
      expect(impl.promptForPlayServices.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('makePlayServicesAvailable', () => {
    test('it calls the implementation', async () => {
      impl.makePlayServicesAvailable.mockResolvedValue('foo');
      const res = await makePlayServicesAvailable();
      expect(res).toBe('foo');
      expect(impl.makePlayServicesAvailable.mock.calls).toHaveLength(1);
      expect(impl.makePlayServicesAvailable.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('resolutionForPlayServices', () => {
    test('it calls the implementation', async () => {
      impl.resolutionForPlayServices.mockResolvedValue('foo');
      const res = await resolutionForPlayServices();
      expect(res).toBe('foo');
      expect(impl.resolutionForPlayServices.mock.calls).toHaveLength(1);
      expect(impl.resolutionForPlayServices.mock.calls[0][0]).toBeUndefined();
    });
  });

  describe('isFirebaseError', () => {
    test('it returns true if firebase error', async () => {
      const error = new FirebaseError(new Error(), 'example', 'example_code');

      expect(isFirebaseError(error)).toBeTruthy();
    });
  });
});
