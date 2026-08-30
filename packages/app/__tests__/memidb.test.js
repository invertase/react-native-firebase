import { describe, expect, it, jest } from '@jest/globals';

import FakeEvent from '../lib/internal/web/memidb/lib/FakeEvent';
import FakeEventTarget from '../lib/internal/web/memidb/lib/FakeEventTarget';

describe('memidb event target', function () {
  it('preserves registered listeners when removing an unknown listener', function () {
    const target = new FakeEventTarget();
    const firstListener = jest.fn();
    const secondListener = jest.fn();

    target.addEventListener('success', firstListener);
    target.addEventListener('success', secondListener);
    target.removeEventListener('success', jest.fn());
    target.dispatchEvent(new FakeEvent('success'));

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);
  });
});
