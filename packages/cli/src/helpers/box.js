/* eslint-disable no-console */
const boxen = require('boxen');
const chalk = require('chalk');

const EMPTY_ROW = '';

module.exports = {
  boxen,
  errorWithStack(error, header = '') {
    if (header) {
      console.log(EMPTY_ROW);
      console.log(`    🔴️  ${chalk.bold.underline.red(header)}`);
    }
    console.log(
      boxen(chalk.red(error.stack), {
        padding: 1,
        margin: 1,
        borderColor: 'red',
      }),
    );
  },

  warnWithStack(error, header = '') {
    if (header) {
      console.log(EMPTY_ROW);
      console.log(`    ⚠️  ${chalk.bold.underline.yellow(header)}`);
    }
    console.log(
      boxen(chalk.yellow(error.stack), {
        padding: 1,
        margin: 1,
        borderColor: 'yellow',
      }),
    );
  },
  /**
   *
   * @param textOrArray
   * @param header
   */
  error(textOrArray, header = '') {
    const text = Array.isArray(textOrArray) ? textOrArray.join('\n') : textOrArray;

    if (header) {
      console.log(EMPTY_ROW);
      console.log(`    🔴️  ${chalk.bold.underline.red(header)}`);
    }
    console.log(
      boxen(chalk.red(text), {
        padding: 1,
        margin: 1,
        borderColor: 'red',
      }),
    );
  },

  /**
   *
   * @param textOrArray
   * @param header
   */
  warn(textOrArray, header = '') {
    const text = Array.isArray(textOrArray) ? textOrArray.join('\n') : textOrArray;

    if (header) {
      console.log(EMPTY_ROW);
      console.log(`    ⚠️  ${chalk.bold.underline.yellow(header)}`);
    }

    console.log(
      boxen(chalk.yellow(text), {
        padding: 1,
        margin: 1,
        borderColor: 'yellow',
      }),
    );
  },

  /**
   *
   * @param textOrArray
   * @param header
   */
  info(textOrArray, header = '') {
    const text = Array.isArray(textOrArray) ? textOrArray.join('\n') : textOrArray;

    if (header) {
      console.log(EMPTY_ROW);
      console.log(`    🔵️  ${chalk.bold.underline.blue(header)}`);
    }

    console.log(
      boxen(chalk.white(text), {
        padding: 1,
        margin: 1,
        borderColor: 'white',
      }),
    );
  },
};
