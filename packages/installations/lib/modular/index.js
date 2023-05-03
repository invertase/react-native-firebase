import { firebase } from '..';

export function getInstallations(app) {
  if (app) {
    return firebase.app(app.name).installations();
  }
  return firebase.app().installations();
}

export function deleteInstallations(installations) {
  return installations.delete();
}
