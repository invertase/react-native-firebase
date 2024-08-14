import asyncStorage from '@react-native-async-storage/async-storage';
import {
  isMemoryStorage,
  memoryStorage,
  getItem,
  setItem,
  removeItem,
  setReactNativeAsyncStorageInternal,
  prefix,
} from '@react-native-firebase/app/lib/internal/asyncStorage';

describe('firebase.setReactNativeAsyncStorage()', function () {
  beforeEach(async function () {
    setReactNativeAsyncStorageInternal();
    await asyncStorage.clear();
  });

  it('throws if asyncStorage is not an object', function () {
    try {
      firebase.setReactNativeAsyncStorage(123);
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'asyncStorage' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if asyncStorage.setItem is not a function', function () {
    try {
      firebase.setReactNativeAsyncStorage({ setItem: 123 });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'asyncStorage.setItem' must be a function");
      return Promise.resolve();
    }
  });

  it('throws if asyncStorage.getItem is not a function', function () {
    try {
      firebase.setReactNativeAsyncStorage({ setItem: sinon.spy(), getItem: 123 });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'asyncStorage.getItem' must be a function");
      return Promise.resolve();
    }
  });

  it('throws if asyncStorage.removeItem is not a function', function () {
    try {
      firebase.setReactNativeAsyncStorage({
        setItem: sinon.spy(),
        getItem: sinon.spy(),
        removeItem: 123,
      });
      return Promise.reject(new Error('Did not throw an Error.'));
    } catch (error) {
      error.message.should.containEql("'asyncStorage.removeItem' must be a function");
      return Promise.resolve();
    }
  });

  it('sets the async storage instance', async function () {
    isMemoryStorage().should.equal(true);

    const setItemSpy = sinon.spy();
    const getItemSpy = sinon.spy();
    const removeItemSpy = sinon.spy();

    firebase.setReactNativeAsyncStorage({
      setItem: setItemSpy,
      getItem: getItemSpy,
      removeItem: removeItemSpy,
    });

    isMemoryStorage().should.equal(false);

    await setItem('foo', 'bar');
    await getItem('foo');
    await removeItem('foo');

    setItemSpy.should.be.calledOnce();
    getItemSpy.should.be.calledOnce();
    removeItemSpy.should.be.calledOnce();
  });

  it('works with @react-native-async-storage/async-storage', async function () {
    isMemoryStorage().should.equal(true);
    const key = Date.now().toString();
    const value = 'bar';
    firebase.setReactNativeAsyncStorage(asyncStorage);
    isMemoryStorage().should.equal(false);

    // Through our internals,
    await setItem(key, value);
    // Get the value from async-storage, which is prefixed,
    const valueFromAsyncStorage = await asyncStorage.getItem(`${prefix}${key}`);
    // Get the value from our internals, which is not prefixed,
    valueFromAsyncStorage.should.equal(value);
    const valueFromInternal = await getItem(key);
    valueFromInternal.should.equal(value);
    // Values should be identical
    valueFromInternal.should.equal(valueFromAsyncStorage);
    await removeItem(key);
    const valueAfterRemoveInternal = await getItem(key);
    const valueAfterRemoveAsyncStorage = await asyncStorage.getItem(`${prefix}${key}`);
    should.equal(valueAfterRemoveInternal, null);
    should.equal(valueAfterRemoveInternal, valueAfterRemoveAsyncStorage);
  });

  it('works with memory storage', async function () {
    isMemoryStorage().should.equal(true);
    const key = Date.now().toString();
    const value = 'bar';
    await setItem(key, value);
    memoryStorage.has(`${prefix}${key}`).should.equal(true);
    memoryStorage.get(`${prefix}${key}`).should.equal(value);
    (await getItem(key)).should.equal(value);
    await removeItem(key);
    memoryStorage.has(`${prefix}${key}`).should.equal(false);
    should.equal(await getItem(key), null);
  });
});
