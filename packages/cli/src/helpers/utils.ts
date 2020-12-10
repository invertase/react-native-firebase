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

function withParameter(fns: { [key: string]: (...args: any[]) => any }, param: any) {
    const augmented: typeof fns = {};
    for (const [key, fn] of Object.entries(fns)) {
        augmented[key] = (...params: RemoveFirstFromTuple<Parameters<typeof fn>>) =>
            fns[key](param, ...params);
    }
    return augmented;
}

export { promiseDefer, withParameter };
