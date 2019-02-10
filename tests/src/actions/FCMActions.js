export const FCM_SET_TOKEN: string = 'FCM_SET_TOKEN';

export function setToken(token: string): Object {
  return {
    type: FCM_SET_TOKEN,
    token,
  };
}
