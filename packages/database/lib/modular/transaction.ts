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
import type { DatabaseReference, TransactionOptions, TransactionResult } from '../types/database';
import type { DatabaseReferenceWithTransactionInternal } from '../types/internal';

export function runTransaction(
  ref: DatabaseReference,
  transactionUpdate: (currentData: any) => unknown,
  options?: TransactionOptions,
): Promise<TransactionResult> {
  return (ref as DatabaseReferenceWithTransactionInternal).transaction.call(
    ref,
    transactionUpdate,
    undefined,
    options?.applyLocally,
    MODULAR_DEPRECATION_ARG,
  );
}
