import { Config } from '@react-native-community/cli-types';

export default async function helpCommand(args: string[], reactNativeConfig: Config) {
  console.info(`Usage: react-native firebase <command> [options]

Options:
  force                           Bypasses safety checks

Commands:
  init [force]                    Setup Firebase for your app
  doctor                          Display diagnostic information for your app
  help                            Show this overview
`);
}
