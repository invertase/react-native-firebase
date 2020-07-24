export type AppTypes = 'ios' | 'android' | 'web';

export type Apps = { [app in AppTypes]: boolean };

export type TemplateTypes = 'success' | 'failure';

export interface CliOptions {
  platform: AppTypes | 'all' | 'prompt';
  force: boolean;
}

export interface FirebaseConfig {
  'react-native'?: {
    [key: string]: any;
  };
}

export interface GradleDependency {
  group: string;
  name: string;
  version: string;
  type: string;
  excludes: string[];
}

// sorted ASC by severity
export enum Status {
  Info,
  Success,
  Warning,
  Error,
}

export type StatusItem = [string | null, Status];
export interface StatusGroup {
  [key: string]: StatusGroup | StatusItem;
}
