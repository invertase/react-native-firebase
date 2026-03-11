/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { MODULAR_DEPRECATION_ARG } from '@react-native-firebase/app/dist/module/common';
import type { Reference, TransactionResult } from '../types/database';

export interface TransactionOptions {
  readonly applyLocally?: boolean;
}

/**
 * Atomically modifies the data at this location.
 * @param ref - The location to atomically modify.
 * @param transactionUpdate - A developer-supplied function which will be passed the current data.
 * @param options - An options object to configure transactions.
 * @returns {Promise<TransactionResult>}
 */
export function runTransaction(
  ref: Reference,
  transactionUpdate: (currentData: unknown) => unknown,
  options?: TransactionOptions,
): Promise<TransactionResult> {
  return ref.transaction.call(
    ref,
    transactionUpdate,
    undefined,
    options && options.applyLocally,
    MODULAR_DEPRECATION_ARG,
  );
}
