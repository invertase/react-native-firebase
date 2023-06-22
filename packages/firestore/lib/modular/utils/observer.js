/**
 * @param {unknown} obj
 * @returns {boolean}
 */
export function isPartialObserver(obj) {
  const observerMethods = ['next', 'error', 'complete'];
  if (typeof obj !== 'object' || obj == null) return false;

  for (const method of observerMethods) {
    if (method in obj && typeof obj[method] === 'function') {
      return true;
    }
  }

  return false;
}
