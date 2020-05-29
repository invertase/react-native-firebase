import { Config } from '@react-native-community/cli-types';
import initCommand from './commands/init';
import doctorCommand from './commands/doctor';
import playgroundCommand from './commands/playground';
import log from './helpers/log';
import { reportModified } from './helpers/tracker';
import CliError from './helpers/error';
import helpCommand from './commands/help';

const commands = [
  {
    name: 'firebase',
    options: [
      {
        name: 'platform',
        description: 'Run the init script for a specific platform, e.g. android or ios.',
        default: '',
      },
    ],
    func: firebaseCli,
  },
];

async function firebaseCli(args: string[], reactNativeConfig: Config) {
  const [command, ...cmdArgs] = args;

  try {
    switch (command) {
      case 'init':
        await initCommand(cmdArgs, reactNativeConfig);
        break;
      case 'doctor':
        await doctorCommand(cmdArgs, reactNativeConfig);
        break;
      case 'playground':
        await playgroundCommand(cmdArgs, reactNativeConfig);
        break;
      case undefined:
      case 'help':
        await helpCommand(cmdArgs, reactNativeConfig);
        break;
      default:
        log.error(`Unrecognized firebase command "${command}".`);
        log.info(
          'Run "react-native firebase help" to see a list of all available firebase commands.',
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
