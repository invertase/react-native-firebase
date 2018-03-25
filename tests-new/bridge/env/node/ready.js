/* eslint-disable no-return-assign */
let ready = false;
process.on('bridge-attached', () => (ready = true));

module.exports = {
  wait() {
    if (ready) return Promise.resolve();
    return new Promise(resolve => {
      process.once('bridge-attached', resolve);
    });
  },
  reset() {
    ready = false;
  },
};
