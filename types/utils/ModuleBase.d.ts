import App from '../modules/core/firebase-app';
import { FirebaseModuleConfig, FirebaseNamespace } from '../types';
export default abstract class ModuleBase {
    _app: App;
    namespace: FirebaseNamespace;
    /**
     *
     * @param app
     * @param config
     */
    constructor(app: App, config: FirebaseModuleConfig);
    /**
     * Returns the App instance for current module
     * @return {*}
     */
    readonly app: App;
}
