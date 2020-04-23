import perf from '@react-native-firebase/perf';

describe('namespace', () => {
  it('errors if not boolean', async () => {
    expect(true).toBe(true);
    // @ts-ignore

    expect(() => perf().setPerformanceCollectionEnabled()).toThrow('must be a boolean');
  });
});
