import Chalk from 'chalk';
import Firebase from './firebase';
import { Account, Project } from '../types/firebase';
// @ts-ignore not exported correctly in TS
const { prompt, AutoComplete } = require('enquirer');

async function input(message: string, prefix?: string): Promise<string> {
    return (
        await prompt({
            message,
            type: 'input',
            name: 'value',
            prefix: `[${prefix || '🤔'}]`,
        })
    ).value;
}

/**
 * Generic ask a question - resolves true or false
 *
 * @param message
 * @param prefix
 * @returns {Promise<boolean>}
 */
async function confirm(message: string, prefix?: string): Promise<boolean> {
    return (
        await prompt({
            message,
            type: 'confirm',
            prefix: `[${prefix || '🤔'}]`,
            initial: true,
            name: 'confirmed',
        })
    ).confirmed;
}

/**
 * Prompt the user to select an item from a array
 *
 * @param message
 * @param choices
 * @param prefix
 * @returns {Promise<*>}
 */
async function selectOneFromArray(
    message: string,
    choices: {
        name: string;
        value: number;
    }[],
    prefix = '🔥',
): Promise<number> {
    const prompt = new AutoComplete({
        choices,
        message,
        name: 'choice',
        limit: 6,
        prefix: `[${prefix}]`,
        footer: Chalk.bgGreen(
            Chalk.grey(
                'Start typing to filter choices, use arrow keys to navigate & ENTER to select',
            ),
        ),
    });
    return prompt.run();
}

/**
 * Prompts the user to start typing and narrows down results to match the typed input
 *
 * @param message
 * @param source
 * @param prefix
 * @param suggestOnly
 * @returns {Promise<*>}
 */
async function selectOneFromAutoComplete(
    message: string,
    source?: (answersSoFar: string[], input: string) => Promise<unknown>, // todo proper type
    prefix = '',
    suggestOnly?: boolean,
) {
    return (
        await prompt({
            message,
            type: 'autocomplete',
            name: 'choice',
            pageSize: 12,
            prefix: `[${prefix}]`,
            source: async (answersSoFar: string[], input: string) => {
                return source ? await source(answersSoFar, input) : () => {};
            },
            suggestOnly: !!suggestOnly,
        })
    ).choice;
}

/**
 * TODO api error handling
 *
 * @returns {Promise<*>}
 */
async function selectFirebaseProject(account: Account): Promise<Project | null> {
    const accountProjects = await Firebase.api(
        account || Firebase.auth.getAccount(),
    ).management.getProjects();

    if (!accountProjects.length) {
        return null;
    }

    const choices = accountProjects.map((project: Project, i: number) => ({
        name:
            project.displayName !== project.projectId
                ? `${project.displayName} (${project.projectId})`
                : project.displayName,
        value: i,
    }));

    if (!choices.length) {
        return null;
    }

    const projectIndex = await selectOneFromArray(
        `Select a Firebase ${Chalk.cyanBright('[projectId]')}:`,
        choices,
    );

    return accountProjects[projectIndex];
}

/**
 * Select an authenticated firebase account by email
 *
 * @returns {Promise<*>}
 */
async function selectFirebaseAccount(allowAll = false, promptToAdd = true) {
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

    let choices = accounts.map((account: any, i: number) => {
        if (account === 'all') {
            return { name: account, value: i };
        }
        const { user } = account;
        return {
            name: user.email,
            value: allowAll ? i + 1 : i,
        };
    });

    if (allowAll) {
        choices = [
            {
                name: 'all',
                value: 0,
            },
            ...choices,
        ];
    }

    return accounts[await selectOneFromArray('Select a Firebase Console account:', choices, '🔐')];
}

export default {
    input,
    confirm,
    selectOneFromArray,
    selectOneFromAutoComplete,
    selectFirebaseProject,
    selectFirebaseAccount,
};
