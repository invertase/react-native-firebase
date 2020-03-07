interface PromiseDefer {
  resolve: Function;
  reject: Function;
  promise: Promise<unknown>;
}

function promiseDefer(): PromiseDefer {
  const deferred: PromiseDefer = {
    resolve: () => {},
    reject: () => {},
    promise: new Promise(() => {}),
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

export { promiseDefer };
