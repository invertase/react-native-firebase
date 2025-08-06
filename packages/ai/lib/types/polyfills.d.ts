declare module 'react-native-fetch-api' {
  export function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

declare global {
  interface RequestInit {
    /**
     * @description Polyfilled to enable text ReadableStream for React Native:
     * @link https://github.com/facebook/react-native/issues/27741#issuecomment-2362901032
     */
    reactNative?: {
      textStreaming: boolean;
    };
  }
}
