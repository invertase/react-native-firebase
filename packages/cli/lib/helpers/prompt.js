const Chalk = require('chalk');
const { prompt, AutoComplete } = require('enquirer');
const Firebase = require('./firebase');

module.exports = {
  /* ---------------
   *     GENERIC
   * -------------- */

  /**
   * Generic ask a question - resolves true or false
   *
   * @param message
   * @param prefix
   * @returns {Promise<ok|boolean>}
   */
  async confirm(message, prefix = '🤔') {
    return (await prompt({
      type: 'confirm',
      prefix: `[${prefix}]`,
      initial: true,
      name: 'confirmed',
      message,
    })).confirmed;
  },

  /**
   * Prompt the user to select an item from a array
   *
   * @param message
   * @param choices
   * @param prefix
   * @returns {Promise<*>}
   */
  async selectOneFromArray(message, choices, prefix = '🔥') {
    const prompt = new AutoComplete({
      name: 'choice',
      limit: 6,
      choices,
      prefix: `[${prefix}]`,
      message,
      footer: Chalk.bgGreen(
        Chalk.grey('Start typing to filter choices, use arrow keys to navigate & ENTER to select'),
      ),
    });
    return prompt.run();
  },

  /**
   * Prompts the user to start typing and narrows down results to match the typed input
   *
   * @param message
   * @param source
   * @param prefix
   * @param suggestOnly
   * @returns {Promise<*>}
   */
  async selectOneFromAutoComplete(
    message,
    source = async () => {},
    prefix = '',
    suggestOnly = false,
  ) {
    return (await prompt({
      type: 'autocomplete',
      name: 'choice',
      pageSize: 12,
      prefix: `[${prefix}]`,
      message,
      source: async (answersSoFar, input) => {
        return await source(answersSoFar, input);
      },
      suggestOnly,
    })).choice;
  },

  /**
   * TODO api error handling
   *
   * @returns {Promise<*>}
   */
  async selectFirebaseProject(account) {
    const apiResponse = await Firebase.api(
      account || Firebase.auth.getAccount(),
    ).management.getProjects();

    const projectsWithId = [];

    const choices = apiResponse.results.map((project, i) => {
      const { projectId, displayName } = project;
      projectsWithId.push({ projectId, ...project });
      return {
        name: displayName !== projectId ? `${displayName} (${projectId})` : displayName,
        value: projectId,
      };
    });

    const selectedProjectId = await module.exports.selectOneFromArray(
      `Select a Firebase ${Chalk.cyanBright('[projectId]')}:`,
      choices,
    );

    return projectsWithId.filter(projects => projects.projectId === selectedProjectId)[0];
  },

  /**
   * Select an authenticated firebase account by email
   *
   * @returns {Promise<*>}
   */
  async selectFirebaseAccount(allowAll = false, promptToAdd = true) {
    let accounts = Firebase.auth.getAccounts();

    if (promptToAdd) {
      // only one account so default to that one
      if (accounts.length === 1) {
        if (
          !(await module.exports.confirm(
            'You only have one account to select from. Add another Firebase account?',
          ))
        ) {
          return accounts[0];
        }

        await Firebase.auth.authWithBrowser();

        accounts = Firebase.auth.getAccounts();
      }

      // no accounts so ask to add one
      if (!accounts.length) {
        if (
          await module.exports.confirm(
            'No accounts found - would you like to add a new Firebase Console account?',
          )
        ) {
          await Firebase.auth.authWithBrowser();
        } else {
          return null;
        }

        accounts = Firebase.auth.getAccounts();

        // only one account so default to that one
        if (accounts.length === 1) {
          return accounts[0];
        }
      }
    }

    if (allowAll) {
      accounts = accounts.length ? ['all', ...accounts] : ['all'];
    }

    const choices = accounts.map((account, i) => {
      if (account === 'all') {
        return { name: account, value: i };
      }
      const { user } = account;
      return {
        name: user.email,
        value: i,
      };
    });

    return accounts[
      await module.exports.selectOneFromArray('Select a Firebase Console account:', choices, '🔐')
    ];
  },
};
