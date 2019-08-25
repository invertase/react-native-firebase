/*
 *  Copyright (c) 2016-present Invertase Limited & Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this library except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

android.describe('android notifications', () => {
  it.only('creates a notification', async () => {
    await firebase.notifications().createChannel({
      name: 'Hello World',
      channelId: 'foo1',
    });

    const newNotification = {
      title: 'Hello',
      subtitle: 'World',
      body: 'foobarbazdaz test test',
      notificationId: Math.random().toString(10),
      android: {
        channelId: 'foo1',
        smallIcon: 'anything because android code currently hard coded',
      },
    };

    await firebase.notifications().displayNotification(newNotification);

    const latestNotification = await device.notifications.latest();

    console.dir(latestNotification);

    latestNotification.should.be.an.Object();

    latestNotification.extras.title.should.equal(newNotification.title);
    latestNotification.extras.subText.should.equal(newNotification.subtitle);
    latestNotification.extras.text.should.equal(newNotification.body);

    // TODO change me when icon no longer hard coded on native
    should.equal(latestNotification.icon.includes('redbox_top_border_background'), true);

    // TODO test other things
  });
});
