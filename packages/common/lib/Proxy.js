/* eslint-disable */
/*
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Source: https://github.com/GoogleChrome/proxy-polyfill
 *
 */

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

let ProxyPoly = global.Proxy;

if (!ProxyPoly) {
  ProxyPoly = (() => {
    let lastRevokeFn = null;
    let ProxyPolyfill;

    /**
     * @param {*} o
     * @return {boolean} whether this is probably a (non-null) Object
     */
    function isObject(o) {
      return o ? typeof o === 'object' || typeof o === 'function' : false;
    }

    /**
     * @constructor
     * @param {!Object} target
     * @param {{apply, construct, get, set}} handler
     */
    ProxyPolyfill = function(target, handler) {
      if (!isObject(target) || !isObject(handler)) {
        throw new TypeError('Cannot create proxy with a non-object as target or handler');
      }

      // Construct revoke function, and set lastRevokeFn so that Proxy.revocable can steal it.
      // The caller might get the wrong revoke function if a user replaces or wraps scope.Proxy
      // to call itself, but that seems unlikely especially when using the polyfill.
      let throwRevoked = function() {};
      lastRevokeFn = function() {
        throwRevoked = function(trap) {
          throw new TypeError(`Cannot perform '${trap}' on a proxy that has been revoked`);
        };
      };

      // Fail on unsupported traps: Chrome doesn't do this, but ensure that users of the polyfill
      // are a bit more careful. Copy the internal parts of handler to prevent user changes.
      const unsafeHandler = handler;
      handler = { get: null, set: null, apply: null, construct: null };
      for (let k in unsafeHandler) {
        if (!(k in handler)) {
          throw new TypeError(`Proxy polyfill does not support trap '${k}'`);
        }
        handler[k] = unsafeHandler[k];
      }
      if (typeof unsafeHandler === 'function') {
        // Allow handler to be a function (which has an 'apply' method). This matches what is
        // probably a bug in native versions. It treats the apply call as a trap to be configured.
        handler.apply = unsafeHandler.apply.bind(unsafeHandler);
      }

      let proxy = this;
      let isMethod = false;
      let isArray = false;
      if (typeof target === 'function') {
        proxy = function ProxyPolyfill() {
          const usingNew = this && this.constructor === proxy;
          const args = Array.prototype.slice.call(arguments);
          throwRevoked(usingNew ? 'construct' : 'apply');

          if (usingNew && handler['construct']) {
            return handler['construct'].call(this, target, args);
          } else if (!usingNew && handler.apply) {
            return handler.apply(target, this, args);
          }

          // since the target was a function, fallback to calling it directly.
          if (usingNew) {
            // inspired by answers to https://stackoverflow.com/q/1606797
            args.unshift(target); // pass class as first arg to constructor, although irrelevant
            // nb. cast to convince Closure compiler that this is a constructor
            const f = /** @type {!Function} */ (target.bind.apply(target, args));
            return new f();
          }
          return target.apply(this, args);
        };
        isMethod = true;
      } else if (target instanceof Array) {
        proxy = [];
        isArray = true;
      }

      const getter = handler.get
        ? function(prop) {
            throwRevoked('get');
            return handler.get(this, prop, proxy);
          }
        : function(prop) {
            throwRevoked('get');
            return this[prop];
          };
      const setter = handler.set
        ? function(prop, value) {
            throwRevoked('set');
            handler.set(this, prop, value, proxy);
          }
        : function(prop, value) {
            throwRevoked('set');
            this[prop] = value;
          };

      // Clone direct properties (i.e., not part of a prototype).
      const propertyNames = Object.getOwnPropertyNames(target);
      const propertyMap = {};
      propertyNames.forEach(function(prop) {
        if ((isMethod || isArray) && prop in proxy) {
          return; // ignore properties already here, e.g. 'bind', 'prototype' etc
        }
        const real = Object.getOwnPropertyDescriptor(target, prop);
        const desc = {
          enumerable: !!real.enumerable,
          get: getter.bind(target, prop),
          set: setter.bind(target, prop),
        };
        Object.defineProperty(proxy, prop, desc);
        propertyMap[prop] = true;
      });

      let prototypeOk = true;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
      } else if (proxy.__proto__) {
        proxy.__proto__ = target.__proto__;
      } else {
        prototypeOk = false;
      }
      if (handler.get || !prototypeOk) {
        for (let k in target) {
          if (propertyMap[k]) {
            continue;
          }
          Object.defineProperty(proxy, k, { get: getter.bind(target, k) });
        }
      }

      Object.seal(target);
      Object.seal(proxy);

      return proxy;
    };

    ProxyPolyfill.revocable = function(target, handler) {
      const p = new ProxyPolyfill(target, handler);
      return { proxy: p, revoke: lastRevokeFn };
    };

    return ProxyPolyfill;
  })();
}

export default ProxyPoly;
