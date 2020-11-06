export type NativeErrorObject = {
  code: string,
  message: string,
  nativeErrorCode: string | number,
  nativeErrorMessage: string,
};

export type NativeErrorResponse = {
  error: NativeErrorObject,
  // everything else
  [key: string]: ?any,
};

export interface NativeErrorInterface extends Error {
  +code: string;
  +message: string;
  +nativeErrorCode: string | number;
  +nativeErrorMessage: string;
}
