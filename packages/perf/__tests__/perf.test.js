import perf from '../lib';

describe('Performance Monitoring', () => {
  describe('setPerformanceCollectionEnabled', () => {
    it('errors if not boolean', async () => {
      expect(() => perf().setPerformanceCollectionEnabled()).toThrow('must be a boolean');
    });
  });
});
