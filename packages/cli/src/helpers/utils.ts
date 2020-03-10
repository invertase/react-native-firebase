interface PromiseDefer<T> {
  resolve: (result: T) => void;
  reject: (error: Error) => void;
  promise: Promise<T>;
}

function promiseDefer<T>(): PromiseDefer<T> {
  const deferred: PromiseDefer<T> = {
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
