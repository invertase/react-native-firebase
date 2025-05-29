/* eslint-disable react/react-in-jsx-scope */
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
