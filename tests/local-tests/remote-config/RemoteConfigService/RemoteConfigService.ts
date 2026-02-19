import type { FetchAndActivateResult, FetchAndActivateSuccess, IRemoteConfigClient } from './types';

export class RemoteConfigService {
  constructor(
    private readonly app: { name: string },
    private readonly client: IRemoteConfigClient,
  ) {}

  async fetchAndActivate(keys: string[]): Promise<FetchAndActivateResult> {
    const remoteConfig = this.client.getRemoteConfig(this.app);

    try {
      const activated = await this.client.fetchAndActivate(remoteConfig);
      const lastFetchStatus = this.client.lastFetchStatus(remoteConfig);
      const timeMillis = this.client.fetchTimeMillis(remoteConfig);
      const fetchTimeStr = timeMillis >= 0 ? new Date(timeMillis).toISOString() : 'never';

      const keyResults: Record<string, { value: string; source: string }> = {};

      for (const key of keys) {
        try {
          const configValue = this.client.getValue(remoteConfig, key);
          const source = configValue.getSource ? configValue.getSource() : 'unknown';
          keyResults[key] = {
            value: configValue.asString(),
            source,
          };
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e);
          keyResults[key] = { value: '', source: `error: ${err}` };
        }
      }

      const success: FetchAndActivateSuccess = {
        success: true,
        activated,
        lastFetchStatus,
        fetchTimeMillis: timeMillis,
        fetchTimeStr,
        keys: keyResults,
      };

      return success;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return { success: false, error };
    }
  }

  static formatResult(result: FetchAndActivateResult): string {
    if (!result.success) {
      return `Error: ${result.error}`;
    }

    let text = `Activated: ${result.activated}\nlastFetchStatus: ${result.lastFetchStatus}\nfetchTimeMillis: ${result.fetchTimeStr}\n\n`;

    for (const [key, { value, source }] of Object.entries(result.keys)) {
      text += `${key}: "${value}" (source: ${source})\n`;
    }

    return text;
  }
}
