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

const typedocRawFile = process.argv[2];

console.log('-------------------  EDIT ME ------------------------');
console.log('path to raw typedoc json ->', typedocRawFile);
console.log('version ->', /(v[0-9]{1,2}\.x\.x)/.exec(typedocRawFile)[0]);
console.log('---------- scripts/docs-parse-typedoc.js ------------');
