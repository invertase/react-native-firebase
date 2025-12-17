const fs = require('fs');
const path = require('path');

// Read version from TypeScript file
const versionFilePath = path.resolve(__dirname, '..', 'lib', 'version.ts');
const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
const versionMatch = versionFileContent.match(/version = ['"](.+?)['"]/);
if (!versionMatch) {
  throw new Error('Could not extract version from version.ts');
}
const version = versionMatch[1];

const outputPath = path.resolve(
  __dirname,
  '..',
  'android',
  'src/reactnative/java/io/invertase/firebase/app',
  'ReactNativeFirebaseVersion.java',
);
const template = `
package io.invertase.firebase.app;
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
// generated file - do not modify or commit
public class ReactNativeFirebaseVersion {
  public static String VERSION = "version_number";
}
`;

fs.writeFileSync(outputPath, template.replace('version_number', `${version}`), 'utf8');
