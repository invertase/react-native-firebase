export type AppTypes = 'ios' | 'android' | 'web';

export type Apps = { [app in AppTypes]: boolean };

export type TemplateTypes = 'success' | 'failure';
