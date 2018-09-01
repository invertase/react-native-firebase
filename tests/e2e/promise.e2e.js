const should = require('should');
require('./../helpers/a2a');

const CODE = 'foo';
const MESSAGE = 'bar';
const ERROR_MESSAGE = 'woops';
const NATIVE_STACK_LIMIT = 10;
let USER_INFO_MAP_SAMPLE = {
  string: 'string',
  number: 0,
  array: [0, 1, 2, 'foo'],
  object: { foo: 'bar' },
};
const ERROR_DEFAULT_CODE = 'EUNSPECIFIED';
const ERROR_DEFAULT_MESSAGE = 'Error not specified.';

describe.only('ReactNativePromise ->', () => {
  // let isIOS = false;
  let isAndroid = false;
  let RNPromiseTestModule = null;

  before(() => {
    RNPromiseTestModule = bridge.rn.NativeModules.RNPromiseTest;
    const { Object } = bridge.context.window;
    USER_INFO_MAP_SAMPLE = Object.assign({}, USER_INFO_MAP_SAMPLE);
    if (bridge.rn.Platform.OS === 'android') isAndroid = true;
    // else isIOS = true;
  });

  // void resolve(@Nullable Object value);
  it('resolves with a value', async () => {
    const value = await RNPromiseTestModule.resolveWithValue(CODE);
    value.should.equal(CODE);
  });

  // void reject(String code, String message);
  it('rejects with a code and message', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeAndMessage(CODE, MESSAGE)
    );

    error.code.should.equal(CODE);
    error.message.should.equal(MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      error.nativeStackAndroid.length.should.equal(0);
      should.equal(error.userInfo, null);
    }
  });

  // void reject(String code, Throwable throwable);
  it('rejects with a code and throwable', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeAndThrowable(CODE, ERROR_MESSAGE)
    );

    error.code.should.equal(CODE);
    error.message.should.equal(ERROR_MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.equal(error.userInfo, null);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(43);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal('rejectWithCodeAndThrowable');
    }
  });

  // void reject(String code, String message, Throwable throwable);
  it('rejects with a code, message and throwable', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeMessageAndThrowable(
        CODE,
        MESSAGE,
        ERROR_MESSAGE
      )
    );

    error.code.should.equal(CODE);
    error.message.should.equal(MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.equal(error.userInfo, null);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(54);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal(
        'rejectWithCodeMessageAndThrowable'
      );
    }
  });

  // void reject(Throwable throwable);
  it('rejects with a throwable', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithThrowable(ERROR_MESSAGE)
    );

    error.code.should.equal(ERROR_DEFAULT_CODE);
    error.message.should.equal(ERROR_MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.equal(error.userInfo, null);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(60);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal('rejectWithThrowable');
    }
  });

  /* ---------------------------
   *  With userInfo WritableMap
   * --------------------------- */

  // void reject(Throwable throwable, WritableMap userInfo);
  it('rejects with a throwable and userInfo', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithThrowableAndMap(
        ERROR_MESSAGE,
        USER_INFO_MAP_SAMPLE
      )
    );

    error.code.should.equal(ERROR_DEFAULT_CODE);
    error.message.should.equal(ERROR_MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.deepEqual(error.userInfo, USER_INFO_MAP_SAMPLE);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(70);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal('rejectWithThrowableAndMap');
    }
  });

  // void reject(String code, @Nonnull WritableMap userInfo);
  it('rejects with a code and userInfo', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeAndMap(CODE, USER_INFO_MAP_SAMPLE)
    );

    error.code.should.equal(CODE);
    error.message.should.equal(ERROR_DEFAULT_MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.deepEqual(error.userInfo, USER_INFO_MAP_SAMPLE);
      error.nativeStackAndroid.length.should.equal(0);
    }
  });

  // void reject(String code, Throwable throwable, WritableMap userInfo);
  it('rejects with a code, throwable and userInfo', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeThrowableAndMap(
        CODE,
        ERROR_MESSAGE,
        USER_INFO_MAP_SAMPLE
      )
    );

    error.code.should.equal(CODE);
    error.message.should.equal(ERROR_MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.deepEqual(error.userInfo, USER_INFO_MAP_SAMPLE);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(87);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal('rejectWithCodeThrowableAndMap');
    }
  });

  // void reject(String code, String message, @Nonnull WritableMap userInfo);
  it('rejects with a code, message and userInfo', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeMessageAndMap(
        CODE,
        MESSAGE,
        USER_INFO_MAP_SAMPLE
      )
    );

    error.code.should.equal(CODE);
    error.message.should.equal(MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.deepEqual(error.userInfo, USER_INFO_MAP_SAMPLE);
      error.nativeStackAndroid.length.should.equal(0);
    }
  });

  // void reject(String code, String message, Throwable throwable, WritableMap userInfo);
  it('rejects with a code, message, throwable and userInfo', async () => {
    const [error] = await A2A(
      RNPromiseTestModule.rejectWithCodeMessageThrowableAndMap(
        CODE,
        MESSAGE,
        ERROR_MESSAGE,
        USER_INFO_MAP_SAMPLE
      )
    );

    error.code.should.equal(CODE);
    error.message.should.equal(MESSAGE);
    error.should.be.instanceOf(bridge.context.window.Error);

    if (isAndroid) {
      should.deepEqual(error.userInfo, USER_INFO_MAP_SAMPLE);
      error.nativeStackAndroid.length.should.equal(NATIVE_STACK_LIMIT);
      const [firstStackFrame] = error.nativeStackAndroid;
      firstStackFrame.should.be.a.Object();
      firstStackFrame.lineNumber.should.equal(110);
      firstStackFrame.file.should.equal('RNPromiseTest.java');
      firstStackFrame.methodName.should.equal(
        'rejectWithCodeMessageThrowableAndMap'
      );
    }
  });
});
