/**
 * 
 * AndroidAction representation wrapper
 */
import RemoteInput, { fromNativeAndroidRemoteInput } from './AndroidRemoteInput';
import { SemanticAction } from './types';
export default class AndroidAction {
  constructor(action, icon, title) {
    this._action = action;
    this._icon = icon;
    this._remoteInputs = [];
    this._showUserInterface = true;
    this._title = title;
  }

  get action() {
    return this._action;
  }

  get allowGeneratedReplies() {
    return this._allowGeneratedReplies;
  }

  get icon() {
    return this._icon;
  }

  get remoteInputs() {
    return this._remoteInputs;
  }

  get semanticAction() {
    return this._semanticAction;
  }

  get showUserInterface() {
    return this._showUserInterface;
  }

  get title() {
    return this._title;
  }
  /**
   *
   * @param remoteInput
   * @returns {AndroidAction}
   */


  addRemoteInput(remoteInput) {
    if (!(remoteInput instanceof RemoteInput)) {
      throw new Error(`AndroidAction:addRemoteInput expects an 'RemoteInput' but got type ${typeof remoteInput}`);
    }

    this._remoteInputs.push(remoteInput);

    return this;
  }
  /**
   *
   * @param allowGeneratedReplies
   * @returns {AndroidAction}
   */


  setAllowGenerateReplies(allowGeneratedReplies) {
    this._allowGeneratedReplies = allowGeneratedReplies;
    return this;
  }
  /**
   *
   * @param semanticAction
   * @returns {AndroidAction}
   */


  setSemanticAction(semanticAction) {
    if (!Object.values(SemanticAction).includes(semanticAction)) {
      throw new Error(`AndroidAction:setSemanticAction Invalid Semantic Action: ${semanticAction}`);
    }

    this._semanticAction = semanticAction;
    return this;
  }
  /**
   *
   * @param showUserInterface
   * @returns {AndroidAction}
   */


  setShowUserInterface(showUserInterface) {
    this._showUserInterface = showUserInterface;
    return this;
  }

  build() {
    if (!this._action) {
      throw new Error('AndroidAction: Missing required `action` property');
    } else if (!this._icon) {
      throw new Error('AndroidAction: Missing required `icon` property');
    } else if (!this._title) {
      throw new Error('AndroidAction: Missing required `title` property');
    }

    return {
      action: this._action,
      allowGeneratedReplies: this._allowGeneratedReplies,
      icon: this._icon,
      remoteInputs: this._remoteInputs.map(remoteInput => remoteInput.build()),
      semanticAction: this._semanticAction,
      showUserInterface: this._showUserInterface,
      title: this._title
    };
  }

}
export const fromNativeAndroidAction = nativeAction => {
  const action = new AndroidAction(nativeAction.action, nativeAction.icon, nativeAction.title);

  if (nativeAction.allowGeneratedReplies) {
    action.setAllowGenerateReplies(nativeAction.allowGeneratedReplies);
  }

  if (nativeAction.remoteInputs) {
    nativeAction.remoteInputs.forEach(remoteInput => {
      action.addRemoteInput(fromNativeAndroidRemoteInput(remoteInput));
    });
  }

  if (nativeAction.semanticAction) {
    action.setSemanticAction(nativeAction.semanticAction);
  }

  if (nativeAction.showUserInterface) {
    action.setShowUserInterface(nativeAction.showUserInterface);
  }

  return action;
};