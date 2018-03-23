/**
 * @flow
 * Dynamic Links representation wrapper
 */
import DynamicLink from './DynamicLink';
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import ModuleBase from '../../utils/ModuleBase';
import { getNativeModule } from '../../utils/native';

import type App from '../core/app';

const NATIVE_EVENTS = ['links_link_received'];

export const MODULE_NAME = 'RNFirebaseLinks';
export const NAMESPACE = 'links';

/**
 * @class Links
 */
export default class Links extends ModuleBase {
  constructor(app: App) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      multiApp: false,
      hasShards: false,
      namespace: NAMESPACE,
    });

    SharedEventEmitter.addListener(
      // sub to internal native event - this fans out to
      // public event name: onMessage
      'links_link_received',
      (link: string) => {
        SharedEventEmitter.emit('onLink', link);
      }
    );
  }

  /**
   * Create long Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createDynamicLink(link: DynamicLink): Promise<string> {
    if (!(link instanceof DynamicLink)) {
      throw new Error(
        `Links:createDynamicLink expects a 'DynamicLink' but got type ${typeof link}`
      );
    }
    return getNativeModule(this).createDynamicLink(link.build());
  }

  /**
   * Create short Dynamic Link from parameters
   * @param parameters
   * @returns {Promise.<String>}
   */
  createShortDynamicLink(
    link: DynamicLink,
    type?: 'SHORT' | 'UNGUESSABLE'
  ): Promise<String> {
    if (!(link instanceof DynamicLink)) {
      throw new Error(
        `Links:createShortDynamicLink expects a 'DynamicLink' but got type ${typeof link}`
      );
    }
    return getNativeModule(this).createShortDynamicLink(link.build(), type);
  }

  /**
   * Returns the link that triggered application open
   * @returns {Promise.<String>}
   */
  getInitialLink(): Promise<string> {
    return getNativeModule(this).getInitialLink();
  }

  /**
   * Subscribe to dynamic links
   * @param listener
   * @returns {Function}
   */
  onLink(listener: string => any): () => any {
    getLogger(this).info('Creating onLink listener');

    SharedEventEmitter.addListener('onLink', listener);

    return () => {
      getLogger(this).info('Removing onLink listener');
      SharedEventEmitter.removeListener('onLink', listener);
    };
  }
}

export const statics = {
  DynamicLink,
};
