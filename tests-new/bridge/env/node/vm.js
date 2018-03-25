/* eslint-disable guard-for-in,no-restricted-syntax,no-return-assign */
const url = require('url');
const http = require('http');
const invariant = require('assert');
const { Script } = require('vm');
const context = require('./context');

let send;
let bundle;

const PREPARE = 'prepareJSRuntime';
const EXECUTE = 'executeApplicationScript';
const TEMP_BUNDLE_PATH = '/tmp/bridge/react-native.js';

function reply(id, result) {
  send({
    replyID: id,
    result,
  });
}

function handleError(message) {
  throw new Error(message);
}

async function downloadBundle(bundleUrl) {
  const res = await new Promise((resolve, reject) =>
    http.get(bundleUrl, resolve).on('error', reject)
  );

  let buffer = '';

  res.setEncoding('utf8');
  res.on('data', chunk => (buffer += chunk));
  await new Promise(resolve => res.on('end', resolve));

  bundle = new Script(buffer, {
    timeout: 120000,
    displayErrors: true,
    filename: TEMP_BUNDLE_PATH,
  });

  return bundle;
}

async function getBundle(request) {
  if (bundle) return bundle;
  console.log('Downloading app bundle...');

  const parsedUrl = url.parse(request.url, true);
  invariant(parsedUrl.query);
  parsedUrl.query.inlineSourceMap = true;
  delete parsedUrl.search;

  return downloadBundle(url.format(parsedUrl));
}

module.exports = {
  set send(fn) {
    send = fn;
  },

  async message(request) {
    const { method } = request;
    // console.log(request.method);
    switch (method) {
      case PREPARE:
        await context.cleanup();
        context.create();
        reply(request.id);
        break;

      case EXECUTE: {
        const script = await getBundle(request);
        if (global.bridge.context == null) {
          throw new Error('VM context was not prepared.');
        }
        if (request.inject) {
          for (const name in request.inject) {
            global.bridge.context[name] = JSON.parse(request.inject[name]);
          }
        }
        script.runInContext(global.bridge.context, {
          filename: TEMP_BUNDLE_PATH,
        });
        reply(request.id);
        break;
      }

      default: {
        let returnValue = [[], [], [], 0];
        try {
          if (
            global.bridge.context != null &&
            typeof global.bridge.context.__fbBatchedBridge === 'object'
          ) {
            returnValue = global.bridge.context.__fbBatchedBridge[method].apply(
              null,
              request.arguments
            );
          }
        } catch (e) {
          if (method !== '$disconnected') {
            handleError(
              `Failed while making a call bridge call ${method}::${e.message}`
            );
          }
        } finally {
          reply(request.id, JSON.stringify(returnValue));
        }
      }
    }
  },
};
