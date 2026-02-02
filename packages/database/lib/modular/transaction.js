/**
 * @typedef {import('./database').DatabaseReference} DatabaseReference
 * @typedef {import('./transaction').TransactionOptions} TransactionOptions
 * @typedef {import('./transaction').TransactionResult} TransactionResult
 */

/**
 * @param {DatabaseReference} ref
 * @param {(options: any) => unknown} transactionUpdate
 * @param {TransactionOptions?} options
 * @returns {Promise<TransactionResult>}
 */

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';

export function runTransaction(ref, transactionUpdate, options) {
  return ref.transaction.call(
    ref,
    transactionUpdate,
    undefined,
    options && options.applyLocally,
    MODULAR_DEPRECATION_ARG,
  );
}
