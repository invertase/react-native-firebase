/**
 * "sleep" for the specified time in milliseconds - returns a promise
 *
 * @param duration milliseconds
 * @return {Promise<any> | Promise}
 */
module.exports.sleep = function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
};

/**
 * Get the current react native platform based on current test job with
 * a fallback to process.platform
 *
 * @return {string}
 */
module.exports.getReactNativePlatform = function getReactNativePlatform() {
  if (process.env.CIRCLE_JOB) {
    if (process.env.CIRCLE_JOB.includes('android')) {
      return 'android';
    }
    if (process.env.CIRCLE_JOB.includes('ios')) {
      return 'ios';
    }
  }

  if (process.platform.includes('darwin')) {
    return 'ios';
  }

  return 'android';
};

/**
 * Async/Await to Array [error, result]
 *
 * Examples:
 *
 *    // 0 - standard usage
 *
 *        const [dbError, dbResult] = await A2A(TodoModel.find({ id: 1 }));
 *
 *    // 1) if an error isn't needed:
 *
 *        const [ , dbResult ] = await A2A(TodoModel.find({ id: 1 }));
 *        // if (!dbResult) return somethingSomethingHandleResult();
 *
 *    // 2) if a result isn't needed:
 *
 *        const [ dbError ] = await A2A(TodoModel.destroy({ id: 1 }));
 *        if (dbError) return somethingSomethingHandleError();
 *
 *    // 3) if neither error or result are needed:
 *
 *        await A2A(TodoModel.destroy({ id: 1 }));
 *
 *    // 4) multiple promises
 *
 *        const promises = [];
 *
 *        promises.push(Promise.resolve(1));
 *        promises.push(Promise.resolve(2));
 *        promises.push(Promise.resolve(3));
 *
 *        const [ , results ] = await A2A(promises);
 *
 *    // 5) non promise values
 *
 *        const [ error, nothingHere ] = await A2A(new Error('Just a foo in a bar world'));
 *        if (error) profit(); // ?
 *
 *        const [ nothingHere, myThing ] = await A2A('A thing string');
 *
 *
 * @param oOrP Object or Primitive
 * @returns {*} Promise<Array>
 * @constructor
 */
module.exports.A2A = function A2A(oOrP) {
  if (!oOrP) return Promise.resolve([null, oOrP]);

  // single promise
  if (oOrP.then) {
    return oOrP.then((r) => [null, r]).catch((e) => [e, undefined]);
  }

  // function that returns a single promise
  if (typeof oOrP === 'function') {
    return oOrP()
    .then((r) => [null, r])
    .catch((e) => [e, undefined]);
  }

  // array of promises
  if (Array.isArray(oOrP) && oOrP.length && oOrP[0].then) {
    return Promise.all(oOrP)
    .then((r) => [null, r])
    .catch((e) => [e, undefined]);
  }

  // array of functions that returns a single promise
  if (Array.isArray(oOrP) && oOrP.length && typeof oOrP[0] === 'function') {
    return Promise.all(oOrP.map((f) => f()))
    .then((r) => [null, r])
    .catch((e) => [e, undefined]);
  }

  // non promise values - error
  if (oOrP instanceof Error) return Promise.resolve([oOrP, undefined]);

  // non promise values - any other value
  return Promise.resolve([null, oOrP]);
};
