export interface ConfigKeyResult {
  value: string;
  source: string;
}

export interface FetchAndActivateSuccess {
  success: true;
  activated: boolean;
  lastFetchStatus: string;
  fetchTimeMillis: number;
  fetchTimeStr: string;
  keys: Record<string, ConfigKeyResult>;
}

export interface FetchAndActivateError {
  success: false;
  error: string;
}

export type FetchAndActivateResult = FetchAndActivateSuccess | FetchAndActivateError;

export interface IRemoteConfigClient {
  getRemoteConfig(app: { name: string }): unknown;
  fetchAndActivate(remoteConfig: unknown): Promise<boolean>;
  getValue(remoteConfig: unknown, key: string): { asString(): string; getSource?(): string };
  lastFetchStatus(remoteConfig: unknown): string;
  fetchTimeMillis(remoteConfig: unknown): number;
}
