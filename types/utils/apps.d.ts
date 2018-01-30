import App from '../modules/core/firebase-app';
import { FirebaseNamespace, FirebaseOptions } from '../types';
declare const _default: {
    DEFAULT_APP_NAME: string;
    app(name?: string): App;
    apps(): App[];
    appModule<M>(app: App, InstanceClass: any): () => M;
    deleteApp(name: string): Promise<boolean>;
    initializeApp(options: FirebaseOptions, name: string): App;
    initializeNativeApps(): void;
    moduleAndStatics(namespace: FirebaseNamespace, statics: any, moduleName: string): any;
};
export default _default;
