import { Config } from '@react-native-community/cli-types';
import Chalk from 'chalk';
import initCommand from './commands/init';
import doctorCommand from './commands/doctor';
// import playgroundCommand from './commands/playground';
import log from './helpers/log';
import { reportModified } from './helpers/tracker';
import CliError from './helpers/error';
import { CliOptions } from './types/cli';

const commands = [
    {
        name: 'firebase <command>',
        description: `A CLI tool to help setup React Native Firebase for your project. It supports the following commands:
  init  \tInitialise Firebase for the project.
  doctor\tDiagnose common React Native Firebase issues.`,
        options: [
            {
                name: '-p, --platform <platform>',
                description:
                    'Run the action only for a specific platform. Options: android, ios (not supported), web (not supported), all.',
                default: 'prompt',
            },
            {
                name: '-f, --force',
                description:
                    'Bypasses safety checks during potentially destructive operations. (not recommended)',
            },
        ],
        func: firebaseCli,
        examples: [
            {
                desc: 'Initialise Firebase for the project regardless of pending changes',
                cmd: 'firebase init --force',
            },
            {
                desc: 'Diagnose Firebase for only the Android side of your project',
                cmd: 'firebase doctor --platform android',
            },
        ],
    },
];

async function firebaseCli(
    args: string[],
    reactNativeConfig: Config,
    options: { platform: string; force: undefined | true },
) {
    const [command, ...cmdArgs] = args;

    // avoid array.includes, because TS doesn't catch on
    if (
        !(
            options.platform == 'android' ||
            options.platform == 'all' ||
            options.platform == 'prompt'
        )
    ) {
        log.error(`Invalid platform "${Chalk.bold(options.platform)}" supplied`);
        return;
    }
    const parsedOptions: CliOptions = {
        platform: options.platform,
        force: Boolean(options.force),
    };

    try {
        switch (command) {
            case 'init':
                await initCommand(cmdArgs, reactNativeConfig, parsedOptions);
                break;
            case 'doctor':
                await doctorCommand(cmdArgs, reactNativeConfig, parsedOptions);
                break;
            case 'playground':
                // await playgroundCommand(cmdArgs, reactNativeConfig, parsedOptions);
                break;
            default:
                log.error(`Unrecognized Firebase command "${Chalk.bold(command)}".`);
                log.info(
                    `Run "${Chalk.bold(
                        'react-native firebase --help',
                    )}" to see a list of all available Firebase commands.`,
                );
        }
    } catch (e) {
        if (e instanceof CliError) {
            log.error(e.message);
            log.error(`Error running ${command} command, process exiting.`);
        } else throw e;
    }

    reportModified();
}

export default commands;
module.exports = commands;
