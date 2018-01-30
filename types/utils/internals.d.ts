declare const _default: {
    OPTIONS: {
        logLevel: string;
        errorOnMissingPlayServices: boolean;
        promptOnMissingPlayServices: boolean;
    };
    FLAGS: {
        checkedPlayServices: boolean;
    };
    STRINGS: {
        WARN_INITIALIZE_DEPRECATION: string;
        readonly ERROR_MISSING_CORE: string;
        ERROR_INIT_OBJECT: string;
        ERROR_INIT_STRING_NAME: string;
        ERROR_MISSING_CB(method: string): string;
        ERROR_MISSING_ARG(type: string, method: string): string;
        ERROR_MISSING_ARG_NAMED(name: string, type: string, method: string): string;
        ERROR_ARG_INVALID_VALUE(name: string, expected: string, got: string): string;
        ERROR_PROTECTED_PROP(name: string): string;
        ERROR_MISSING_MODULE(namespace: string, nativeModule: string): string;
        ERROR_APP_NOT_INIT(appName: string): string;
        ERROR_MISSING_OPT(optName: string): string;
        ERROR_NOT_APP(namespace: string): string;
        ERROR_UNSUPPORTED_CLASS_METHOD(className: string, method: string): string;
        ERROR_UNSUPPORTED_CLASS_PROPERTY(className: string, property: string): string;
        ERROR_UNSUPPORTED_MODULE_METHOD(namespace: string, method: string): string;
        ERROR_PLAY_SERVICES(statusCode: number): string;
    };
};
export default _default;
