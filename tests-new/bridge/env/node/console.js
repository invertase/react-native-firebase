module.exports = function consoleContext() {
  return {
    ...console,
    /**
     * Override console log so we can ignore certain logs like the application being started
     *
     * @param args
     */
    log(...args) {
      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].startsWith('Running application "')
      ) {
        return;
      }

      console.log(...args);
    },
  };
};
