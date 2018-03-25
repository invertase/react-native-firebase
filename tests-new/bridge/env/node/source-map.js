/* eslint-disable no-param-reassign */
const Mocha = require('mocha');
const ErrorStack = require('error-stack-parser');
const { SourceMapConsumer } = require('source-map');

let bundleFileName = null;
const Runner = Mocha.Runner;
let sourceMapConsumer = null;
const originalFail = Runner.prototype.fail;

/**
 * Convert an error frame into a source mapped string
 * @param parsed
 * @returns {string}
 */
function frameToStr(parsed) {
  const { name, line, column, source } = sourceMapConsumer.originalPositionFor({
    line: parsed.lineNumber,
    column: parsed.column,
  });
  return `    at ${name || parsed.functionName || '<anonymous>'} (${source ||
    parsed.fileName}:${line || parsed.lineNumber}:${column ||
    parsed.columnNumber})`;
}

// override mocha fail so we can replace stack traces
Runner.prototype.fail = function fail(test, error) {
  const original = error.stack.split('\n');
  const parsed = ErrorStack.parse(error);

  const newStack = [original[0]];

  for (let i = 0; i < parsed.length; i++) {
    const { fileName } = parsed[i];
    if (fileName === bundleFileName) newStack.push(frameToStr(parsed[i]));
    else newStack.push(original[i + 1]);
  }

  error.stack = newStack.join('\n');
  return originalFail.call(this, test, error);
};

module.exports = {
  /**
   * Build a source map consumer from source map bundle contents
   * @param str
   * @param fileName
   * @returns {Promise<void>}
   */
  async buildSourceMap(str, fileName) {
    bundleFileName = fileName;
    sourceMapConsumer = await new SourceMapConsumer(str);
  },
};
