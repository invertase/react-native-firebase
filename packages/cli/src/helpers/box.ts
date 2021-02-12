/* eslint-disable no-console */
import boxen from 'boxen';
import chalk from 'chalk';

const EMPTY_ROW = '';

export default {
    boxen,
    errorWithStack(error: Error, header?: string) {
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

    warnWithStack(error: Error, header?: string) {
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
    error(textOrArray: string | string[], header?: string) {
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
    warn(textOrArray: string | string[], header?: string) {
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
    info(textOrArray: string | string[], header?: string) {
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
