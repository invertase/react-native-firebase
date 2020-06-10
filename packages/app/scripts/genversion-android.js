const fs = require('fs');
const path = require('path');

const version = require('../lib/version');
const outputPath = path.resolve(
  __dirname,
  '..',
  'android',
  'src/reactnative/java/io/invertase/firebase/app',
  'ReactNativeFirebaseAppRegistrar.java',
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

import androidx.annotation.Keep;

import com.google.firebase.components.Component;
import com.google.firebase.components.ComponentRegistrar;
import com.google.firebase.platforminfo.LibraryVersionComponent;

import java.util.Collections;
import java.util.List;

import io.invertase.firebase.BuildConfig;
// generated file - do not modify or commit
@Keep
public class ReactNativeFirebaseAppRegistrar implements ComponentRegistrar {
  @Override
  public List<Component<?>> getComponents() {
    return Collections.singletonList(
      LibraryVersionComponent.create(
        "react-native-firebase",
        BuildConfig.VERSION_NAME
      )
    );
  }
}

`;

fs.writeFileSync(outputPath, template.replace('BuildConfig.VERSION_NAME', `"${version}"`), 'utf8');
