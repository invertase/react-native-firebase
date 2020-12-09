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

const { readFileSync, unlinkSync } = require('fs');
const path = require('path');
const { Application, TSConfigReader } = require('typedoc');

const tempOutput = path.resolve(process.cwd(), 'typedoc.json');
const app = new Application();
app.options.addReader(new TSConfigReader());

module.exports.generateTypedoc = function generateTypedoc() {
  console.log(path.resolve(__dirname, '../../tsconfig.json'));
  // https://github.com/TypeStrong/typedoc/issues/956
  const { inputFiles } = app.bootstrap({
    mode: 'file',
    includeDeclarations: true,
    excludeExternals: true,
    tsconfig: path.resolve(__dirname, '../../tsconfig.json'),
  });

  app.generateJson(inputFiles, tempOutput);
  const output = readFileSync(tempOutput);

  // Remove the file
  unlinkSync(tempOutput);

  return JSON.parse(output);
};
