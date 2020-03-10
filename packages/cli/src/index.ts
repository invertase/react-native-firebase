import { Config } from '@react-native-community/cli-types';
import initCommand from './commands/init';
import doctorCommand from './commands/doctor';
import playgroundCommand from './commands/playground';
import log from './helpers/log';

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
    default:
      log.error(`command "${command}" not found`);
  }
}

export default commands;
module.exports = commands;
