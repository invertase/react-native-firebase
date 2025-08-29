/* eslint-disable react/react-in-jsx-scope */
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

import { Button, StyleSheet, Text, View } from 'react-native';
import { crash, getCrashlytics } from '@react-native-firebase/crashlytics';

export function CrashTestComponent() {
  return (
    <View style={styles.horizontalCentered}>
      <Text>Crashlytics:</Text>
      <Button
        style={{ color: 'blue', flex: 1 }}
        title="JS Crash"
        onPress={() => nonExistentObject.nonExistentFunction()}
      />
      <Button
        style={{ color: 'blue', flex: 1 }}
        title="Native Crash"
        onPress={() => crash(getCrashlytics())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalCentered: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    paddingHorizontal: 10,
  },
});
