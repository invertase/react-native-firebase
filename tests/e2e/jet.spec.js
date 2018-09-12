const should = require('should');

describe('jet', () => {
  // beforeEach(async function beforeEach() {
  // await device.reloadReactNative();
  // jet.root.setState({ message: this.currentTest.title });
  // });

  it('should provide -> global.jet', async () => {
    should(jet).not.be.undefined();
    return Promise.resolve();
  });

  // main react-native module you're testing on
  // in our case react-native-firebase
  it('should provide -> jet.module', async () => {
    should(jet.module).not.be.undefined();
    return Promise.resolve();
  });

  // react-native module access
  it('should provide -> jet.rn', () => {
    should(jet.rn).not.be.undefined();
    should(jet.rn.Platform.OS).be.a.String();
    should(jet.rn.Platform.OS).equal(device.getPlatform());
    return Promise.resolve();
  });

  // 'global' context of the app's JS environment
  it('should provide -> jet.context', () => {
    should(jet.context).not.be.undefined();
    should(jet.context.setTimeout).be.a.Function();
    should(jet.context.window).be.a.Object();
    // etc ... e.g. __coverage__ is here also if covering
    return Promise.resolve();
  });

  // the apps root component
  // allows you to read and set state if required
  xit('should provide -> jet.root', async () => {
    should(jet.root).not.be.undefined();
    should(jet.root.setState).be.a.Function();
    should(jet.root.state).be.a.Object();

    // test setting state
    await new Promise(resolve =>
      jet.root.setState({ message: 'hello world' }, resolve)
    );
    should(jet.root.state.message).equal('hello world');
    return Promise.resolve();
  });

  // we shim our own reloadReactNative functionality as the detox reloadReactNative built-in
  // hangs often and seems unpredictable - todo: investigate & PR if solution found
  // reloadReactNative is replaced on init with jet.root automatically
  xit('should allow reloadReactNative usage without breaking remote debug', async () => {
    should(jet.reload).be.a.Function();
    // and check it works without breaking anything
    await device.reloadReactNative();
    should(jet.reload).be.a.Function();
    return Promise.resolve();
  });

  // TODO flakey - "This method must not be called before the JS thread is created"
  // https://github.com/facebook/react-native/blob/master/React/CxxBridge/RCTCxxBridge.mm
  xit('should allow launchApp usage without breaking remote debug', async () => {
    should(jet.module).not.be.undefined();
    should(jet.reload).be.a.Function();
    should(jet.rn).not.be.undefined();
    should(jet.rn.Platform.OS).be.a.String();
    should(jet.rn.Platform.OS).equal(device.getPlatform());

    await device.launchApp({ newInstance: true });

    should(jet.module).not.be.undefined();
    should(jet.reload).be.a.Function();
    should(jet.rn).not.be.undefined();
    should(jet.rn.Platform.OS).be.a.String();
    should(jet.rn.Platform.OS).equal(device.getPlatform());
    return Promise.resolve();
  });

  // TIMERS
  it('timing.setTimeout', cb => {
    const start = Date.now();
    jet.context.setTimeout(() => {
      const timeTaken = Date.now() - start;
      if (timeTaken >= 50) cb();
      else cb(new Error('setTimeout fn called too soon.'));
    }, 50);
  });

  it('timing.setInterval', cb => {
    let times = 0;
    let interval;
    const start = Date.now();

    interval = jet.context.setInterval(() => {
      const timeTaken = Date.now() - start;

      times++;
      jet.context.clearInterval(interval);
      if (times >= 2) {
        return cb(new Error('Interval did not cancel correctly.'));
      }

      if (timeTaken < 50) {
        return cb(new Error('setInterval fn called too soon.'));
      }

      return jet.context.setTimeout(cb, 100);
    }, 50);
  });

  it('timing.setImmediate', cb => {
    jet.context.setImmediate(() => cb());
  });

  it('timing.requestIdleCallback', cb => {
    jet.context.requestIdleCallback(() => cb());
  });

  it('timing.requestAnimationFrame', cb => {
    jet.context.requestAnimationFrame(() => cb());
  });
});
