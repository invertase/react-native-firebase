import ModuleBase from './ModuleBase';
export declare const getLogger: (module: ModuleBase) => any;
export declare const initialiseLogger: (module: ModuleBase, logNamespace: string) => void;
export default class Log {
    static createLogger(namespace: string): any;
    static setLevel(booleanOrDebugString: boolean | string): void;
}
