/**
 * Converts a synchronous iterable into an asynchronous iterable.
 */
async function* asyncIterable(iterable) {
  // eslint-disable-next-line no-restricted-syntax
  for (const element of iterable) {
    yield element;
  }
}

function throttle(fn, minInterval = 750) {
  let last;
  let deferTimer;
  return function throttleInner(...args) {
    const now = Date.now();
    if (last && now < last + minInterval) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn(...args);
      }, minInterval);
    } else {
      last = now;
      fn(...args);
    }
  };
}

module.exports = {
  asyncIterable,
  throttle,
};
