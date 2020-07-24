declare module 'is-git-dirty' {
  function isGitDirty(): boolean;
  export default isGitDirty;
}

declare module 'gradle-to-js/lib/parser' {
  interface Representation {
    [key: string]: any;
  }
  export function parseFile(gradleFilePath: string): Promise<Representation>;
  export function parseText(gradleFileText: string): Promise<Representation>;
}

declare module '@react-native-community/cli-tools' {
  export namespace logger {
    let verbose: boolean;

    export function success(...messages: Array<string>): void;
    export function info(...messages: Array<string>): void;
    export function warn(...messages: Array<string>): void;
    export function error(...messages: Array<string>): void;
    export function debug(...messages: Array<string>): void;
    export function log(...messages: Array<string>): void;
    export function setVerbose(level: boolean): void;
    export function isVerbose(): typeof verbose;
    export function disable(): void;
    export function enable(): void;
  }
}

declare module '@react-native-community/cli/build/tools/loader' {
  import ora from 'ora';

  class OraNoop implements ora.Ora {
    spinner: ora.Spinner;
    indent: number;
    isSpinning: boolean;
    text: string;
    prefixText: string;
    color: ora.Color;

    succeed(_text?: string | undefined): ora.Ora;
    fail(_text?: string | undefined): ora.Ora;
    start(_text?: string | undefined): ora.Ora;
    stop(_text?: string | undefined): ora.Ora;
    warn(_text?: string | undefined): ora.Ora;
    info(_text?: string | undefined): ora.Ora;
    stopAndPersist(): ora.Ora;
    clear(): ora.Ora;
    render(): ora.Ora;
    frame(): string;
  }

  export function getLoader(): typeof OraNoop;
  export const NoopLoader: typeof OraNoop;
}
