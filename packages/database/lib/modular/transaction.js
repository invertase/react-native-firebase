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
export function runTransaction(ref, transactionUpdate, options) {
  return ref.transaction(transactionUpdate, undefined, options && options.applyLocally);
}
