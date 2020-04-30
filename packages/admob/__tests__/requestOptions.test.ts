import validator from '../lib';

describe('Admob RequestOptions', () => {
  it('returns an empty object is not defined', () => {
    expect(validator()).toBeDefined();
  });
});
