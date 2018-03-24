const url = require('url');
const http = require('http');
const invariant = require('assert');
const { createContext, Script } = require('vm');
const ws = require('./ws');
const { merge } = require('deeps');

global.bridge.context = null;
global.__coverage__ = {};
let scriptCached = null;

// this is a dummy file path - without a file name the source map is not used in the vm
const TEMP_BUNDLE_PATH = '/tmp/bridge/react-native.js';

// TODO  -----------------------------------------------------------------------
// TODO  -----------------------------------------------------------------------
// TODO  -----------------------------------------------------------------------
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO This is just dirty code created just as a proof of concept
// TODO  - need to clean it all up / refactor
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO  -----------------------------------------------------------------------
// TODO  -----------------------------------------------------------------------
// TODO  -----------------------------------------------------------------------

/**
 *
 * @param replyId
 * @param result
 */
function sendResult(replyID, result) {
  ws.send(
    JSON.stringify({
      replyID,
      result,
    })
  );
}

/**
 * TODO
 * @param message
 */
function sendError(error) {
  console.log('error');
  throw error;
}

/**
 *
 * @param src
 * @param callback
 */
function getScript(src, callback) {
  if (scriptCached) return callback(null, scriptCached);
  return http
    .get(src, res => {
      let buff = '';

      res.setEncoding('utf8');

      res.on('data', chunk => {
        buff += chunk;
      });

      res.on('end', () => {
        scriptCached = new Script(buff, {
          // lineOffset: -1,
          // columnOffset: -1,
          timeout: 120000,
          displayErrors: true,
          produceCachedData: true,
          filename: TEMP_BUNDLE_PATH,
        });

        callback(null, scriptCached);
      });
    })
    .on('error', err => {
      callback(err);
    });
}

function consoleShim() {
  return {
    ...console,
    log(...args) {
      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].startsWith('Running application "')
      ) {
        return;
      }

      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].startsWith('Deprecated')
      ) {
        return;
      }
      console.log(...args);
    },
    warn(...args) {
      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].startsWith('Running application "')
      ) {
        return;
      }

      if (
        args[0] &&
        typeof args[0] === 'string' &&
        args[0].startsWith('Deprecated')
      ) {
        return;
      }
      console.log(...args);
    },
  };
}

process.on('ws-message', request => {
  // console.log(request.method);
  switch (request.method) {
    case 'prepareJSRuntime':
      if (global.bridge.context) {
        // todo __coverage__ not working - mostly empty statements in output
        merge(global.__coverage__, global.bridge.context.__coverage__ || {});

        try {
          for (const name in global.bridge.context.__fbBatchedBridge) {
            global.bridge.context.__fbBatchedBridge[name] = undefined;
            delete global.bridge.context.__fbBatchedBridge[name];
          }

          for (const name in global.bridge.context.__fbGenNativeModule) {
            global.bridge.context.__fbGenNativeModule[name] = undefined;
            delete global.bridge.context.__fbGenNativeModule[name];
          }

          for (const name in global.bridge.context.__fbBatchedBridgeConfig) {
            global.bridge.context.__fbBatchedBridgeConfig[name] = undefined;
            delete global.bridge.context.__fbBatchedBridgeConfig[name];
          }

          for (const name in global.bridge.context) {
            global.bridge.context[name] = undefined;
            delete global.bridge.context[name];
          }
        } catch (e) {
          console.error(e);
        }
      }
      global.bridge.context = undefined;
      global.bridge.context = createContext({
        console: consoleShim(),
        __bridgeNode: {
          ready() {
            process.emit('rn-ready');
          },
          provideReactNativeModule(rnModule) {
            global.bridge.rn = undefined;
            global.bridge.rn = rnModule;
          },
          provideModule(moduleExports) {
            global.bridge.module = undefined;
            global.bridge.module = moduleExports;
          },
          provideReload(reloadFn) {
            global.bridge.reload = undefined;
            global.bridge.reload = reloadFn;
          },
          provideRoot(rootComponent) {
            global.bridge.root = undefined;
            global.bridge.root = rootComponent;
          },
        },
      });
      sendResult(request.id);
      return;

    case 'executeApplicationScript':
      // Modify the URL to make sure we get the inline source map.
      // TODO we shouldn't be reparsing if scriptCached is set
      const parsedUrl = url.parse(request.url, /* parseQueryString */ true);
      invariant(parsedUrl.query);
      parsedUrl.query.inlineSourceMap = true;
      delete parsedUrl.search;
      // $FlowIssue url.format() does not accept what url.parse() returns.
      const scriptUrl = url.format(parsedUrl);

      getScript(scriptUrl, (err, script) => {
        if (err != null) {
          sendError(`Failed to get script from packager: ${err.message}`);
          return;
        }

        if (global.bridge.context == null) {
          sendError('JS runtime not prepared');
          return;
        }

        if (request.inject) {
          for (const name in request.inject) {
            global.bridge.context[name] = JSON.parse(request.inject[name]);
          }
        }

        try {
          script.runInContext(global.bridge.context, TEMP_BUNDLE_PATH);
        } catch (e) {
          sendError(e);
        }
        sendResult(request.id);
      });

      return;

    default:
      let returnValue = [[], [], [], 0];
      try {
        if (
          global.bridge.context != null &&
          typeof global.bridge.context.__fbBatchedBridge === 'object'
        ) {
          returnValue = global.bridge.context.__fbBatchedBridge[
            request.method
          ].apply(null, request.arguments);
        }
      } catch (e) {
        if (request.method !== '$disconnected') {
          sendError(
            `Failed while making a call ${request.method}:::${e.message}`
          );
        }
      } finally {
        sendResult(request.id, JSON.stringify(returnValue));
      }
  }
});
