const url = require('url');
const http = require('http');
const invariant = require('assert');
const { createContext, Script } = require('vm');
const ws = require('./ws');

let currentContext = null;
let scriptCached = null;

// this is a dummy file path - without a file name the source map is not used in the vm
const TEMP_BUNDLE_PATH = '/tmp/bridge/react-native.js';

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
 *
 * @param message
 */
function sendError(message) {
  console.error(message);
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

process.on('ws-message', request => {
  // console.log(request.method);
  switch (request.method) {
    case 'prepareJSRuntime':
      currentContext = undefined;
      currentContext = createContext({
        console,
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

        if (currentContext == null) {
          sendError('JS runtime not prepared');
          return;
        }

        if (request.inject) {
          for (const name in request.inject) {
            currentContext[name] = JSON.parse(request.inject[name]);
          }
        }

        try {
          script.runInContext(currentContext, TEMP_BUNDLE_PATH);
        } catch (e) {
          sendError(`Failed to exec script: ${e.message}`);
        }
        sendResult(request.id);
      });

      return;

    default:
      let returnValue = [[], [], [], 0];
      try {
        if (
          currentContext != null &&
          typeof currentContext.__fbBatchedBridge === 'object'
        ) {
          returnValue = currentContext.__fbBatchedBridge[request.method].apply(
            null,
            request.arguments
          );
        }
      } catch (e) {
        sendError(
          `Failed while making a call ${request.method}:::${e.message}`
        );
      } finally {
        sendResult(request.id, JSON.stringify(returnValue));
      }
  }
});
