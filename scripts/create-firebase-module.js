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

const { join, resolve } = require('path');
const { readdirSync, renameSync, statSync } = require('fs');

const shelljs = require('shelljs');
const inquirer = require('inquirer');
const { version } = require('./../lerna');

function walkDir(dir) {
  let results = [];
  const list = readdirSync(dir);
  list.forEach(function (file) {
    file = dir + '/' + file;
    const stat = statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of this module, e.g. analytics:',
      default: 'iid',
    },
  ])
  .then(answers => {
    const { name } = answers;
    const packageDir = `packages/${name}`;
    const nameUpper = name.charAt(0).toUpperCase() + name.slice(1);

    shelljs.cp('-R', 'scripts/_TEMPLATE_', packageDir);
    shelljs.exec(
      `find ./${packageDir}/ -type f -exec sed -i '' -e "s/_template_/${name}/g" {} \\;`,
    );
    shelljs.exec(
      `find ./${packageDir}/ -type f -exec sed -i '' -e "s/_Template_/${nameUpper}/g" {} \\;`,
    );
    shelljs.exec(
      `find ./${packageDir}/package.json -type f -exec sed -i '' -e "s/_VERSION_/${version}/g" {} \\;`,
    );

    return Promise.resolve({ name, nameUpper });
  })
  .then(({ name, nameUpper }) => {
    const dir = resolve(`./packages/${name}/`);
    const templateFiles = walkDir(dir).filter(file => {
      return file.includes('_template_') || file.includes('_Template_');
    });

    shelljs.mv(`${dir}/ios/RNFB_Template_`, `${dir}/ios/RNFB${nameUpper}`);
    shelljs.mv(`${dir}/ios/RNFB_Template_.xcodeproj`, `${dir}/ios/RNFB${nameUpper}.xcodeproj`);
    shelljs.mv(
      `${dir}/android/src/main/java/io/invertase/firebase/_template_`,
      `${dir}/android/src/main/java/io/invertase/firebase/${name}`,
    );

    for (let i = 0; i < templateFiles.length; i++) {
      const templateFile = templateFiles[i]
        .replace(
          `${dir}/android/src/main/java/io/invertase/firebase/_template_`,
          `${dir}/android/src/main/java/io/invertase/firebase/${name}`,
        )
        .replace(`${dir}/ios/RNFB_Template_/`, `${dir}/ios/RNFB${nameUpper}/`)
        .replace(`${dir}/ios/RNFB_Template_.x`, `${dir}/ios/RNFB${nameUpper}.x`);
      const newTemplateFilePath = templateFile
        .replace(/_template_/g, name)
        .replace(/_Template_/g, nameUpper);
      renameSync(templateFile, newTemplateFilePath);
    }
    return Promise.resolve({ name, nameUpper });
  })
  .then(({ name, nameUpper }) => {
    shelljs.exec(`lerna add @react-native-firebase/${name} tests && yarn`);
    console.log('');
    console.log(`The module '${name}' (${nameUpper}) has been created!`);
    console.log('');
    console.log('');
    console.log('1) ADD IT TO `KNOWN_NAMESPACES` in packages/app/lib/internal/constants.js');
    console.log('');
    console.log('2) ADD IT TO THE docs:');
    console.log('  - in docs/<modulename>/index.md and usage/index.md');
    console.log(
      '  - in docs/<modules>/... find the prev next links where you slice in and fix them',
    );
    console.log('  - in docs/app/usage.md list of apps that are multi-app, if it is multi-app');
    console.log('  - in docs/sidebar.yaml');
    console.log('  - in website/scripts/source-reference.js');
    console.log('  - in website/src/templates/utils.ts');
    console.log('');
    console.log('3) If the name has hyphens, carefully check:');
    console.log('  - package namespaces in java and package.json and index.d.ts');
    console.log('  - the @firebase tag in index.d.ts (creates docs site reference API links)');
    console.log('');
    console.log('4) Add the e2e tests:');
    console.log('  - tests/e2e/.mocharc.js');
    console.log('  - tests/package.json (and run yarn + yarn tests:pod:install)');
    console.log('  - tests/app.js');
    console.log('');
  })
  .catch(console.error);
