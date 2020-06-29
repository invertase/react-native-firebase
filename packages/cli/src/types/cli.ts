export type AppTypes = 'ios' | 'android' | 'web';

export type Apps = { [app in AppTypes]: boolean };

export type TemplateTypes = 'success' | 'failure';

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
