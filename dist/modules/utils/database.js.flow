import SyncTree from '../../utils/SyncTree';

export default {
  /**
   * Removes all database listeners (JS & Native)
   */
  cleanup(): void {
    SyncTree.removeListenersForRegistrations(
      Object.keys(SyncTree._reverseLookup)
    );
  },
};
