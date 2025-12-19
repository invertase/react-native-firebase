import React from 'react';
import { AppRegistry, Button, Text, View } from 'react-native';
import analytics, { firebase, logEvent } from '@react-native-firebase/analytics';

function App() {
  return (
    <View>
      <Text>text text text</Text>
      <Text>text text text</Text>
      <Button
        title="Send analytics"
        onPress={async () => {
          try {
            const app = firebase.app();
            const analyticsInstance = analytics();
            console.log('used to test typing for firebase and analytics()', app);
            logEvent(analyticsInstance, 'screen_view', {
              screen_name: 'screenName',
              screen_class: 'screenClass',
            });

            await analytics().logAddToCart({
              currency: 'usd',
              value: 1000,
              items: [
                {
                  item_brand: 'Item Brand',
                  item_category: 'shoe',
                  item_id: 'S0158DF0FF20000U',
                  item_name: 'Espadrille',
                  item_variant: 'S0158DF0FF20000U-35',
                },
                {
                  item_brand: 'Item Brand',
                  item_category: 'shoe',
                  item_id: 'S0158DF0FF2WERKCREV',
                  item_name: 'Espadrille-2',
                  item_variant: 'S0158DF0FF20000U-39058506',
                },
              ],
            });
            console.log('Sent');
          } catch (e) {
            console.log('ERROR', e);
          }
        }}
      />
    </View>
  );
}

AppRegistry.registerComponent('testing', () => App);
