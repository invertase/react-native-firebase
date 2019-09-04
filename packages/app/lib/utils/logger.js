/* eslint-disable no-console */
/**
 * List of ansi colors
 * @url https://github.com/shiena/ansicolor/blob/master/README.md
 */

import { isArray, isNull, isObject, isString } from '@react-native-firebase/app/lib/common';

const config = {
  enableMethodLogging: false,
  enableEventLogging: false,
};

/**
 * Resets terminal to default color
 */
function resetTerminalColor() {
  console.log('\x1b[0m');
}

/**
 * Info level log
 * @param {String} text
 * @param {Array} params
 */
function info(text, params = null) {
  if (!isString(text)) {
    throw new Error(`Invalid text passed to logger. Expected string, but got ${typeof text}`);
  }
  console.log('\x1b[35m', text);

  if (!isArray(params) && !isObject(params) && !isNull(params)) {
    throw new Error(
      `Invalid params passed to logger. Expected array or object, but got ${typeof params}`,
    );
  }
  if (params) {
    console.log('\x1b[94m', JSON.stringify(params, null, 2));
  }

  resetTerminalColor();
}

export default {
  config,
  info,
};
