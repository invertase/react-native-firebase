/**
 * @flow
 * Invites representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';
import Invitation from './Invitation';

import type App from '../core/app';

export const MODULE_NAME = 'RNFirebaseInvites';
export const NAMESPACE = 'invites';
const NATIVE_EVENTS = ['invites_invitation_received'];

type InvitationOpen = {
  deepLink: string,
  invitationId: string,
};

export default class Invites extends ModuleBase {
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      hasShards: false,
      moduleName: MODULE_NAME,
      multiApp: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'invites_invitation_received',
      (invitation: InvitationOpen) => {
        SharedEventEmitter.emit('onInvitation', invitation);
      }
    );
  }

  /**
   * Returns the invitation that triggered application open
   * @returns {Promise.<Object>}
   */
  getInitialInvitation(): Promise<string> {
    return getNativeModule(this).getInitialInvitation();
  }

  /**
   * Subscribe to invites
   * @param listener
   * @returns {Function}
   */
  onInvitation(listener: InvitationOpen => any) {
    getLogger(this).info('Creating onInvitation listener');

    SharedEventEmitter.addListener('onInvitation', listener);

    return () => {
      getLogger(this).info('Removing onInvitation listener');
      SharedEventEmitter.removeListener('onInvitation', listener);
    };
  }

  sendInvitation(invitation: Invitation): Promise<string[]> {
    if (!(invitation instanceof Invitation)) {
      throw new Error(
        `Invites:sendInvitation expects an 'Invitation' but got type ${typeof invitation}`
      );
    }
    return getNativeModule(this).sendInvitation(invitation.build());
  }
}

export const statics = {
  Invitation,
};
