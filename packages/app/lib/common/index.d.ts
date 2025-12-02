export const MODULAR_DEPRECATION_ARG: string;
export const isAndroid: boolean;
export const isNumber: (value: any) => value is number;

export function createMessage(
  nameSpace: string,
  methodName: string,
  instanceName?: string,
  uniqueMessage?: string | null,
): string;
