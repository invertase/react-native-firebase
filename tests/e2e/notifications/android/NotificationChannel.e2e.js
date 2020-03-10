/* eslint-disable no-await-in-loop */
describe('notifications() - Android Only', () => {
  describe('NotificationChannel', () => {
    it('should create, read & delete a channel', async () => {
      if (device.getPlatform() === 'android') {
        const AndroidChannel = firebase.notifications.Android.Channel;

        const name = 'shooby';
        const importance = 5; // MAX
        const channelId = 'fooby';
        const description = 'shooby description';
        const channel = new AndroidChannel(channelId, name, importance);
        channel.setDescription(description);
        channel.setLockScreenVisibility(1);
        channel.setLightColor('#e2e2e2');

        // create
        await firebase.notifications().android.createChannel(channel);

        // read
        const beforeDelete = await firebase
          .notifications()
          .android.getChannel(channelId);

        beforeDelete.name.should.equal(name);
        beforeDelete.sound.should.equal('default');
        beforeDelete.channelId.should.equal(channelId);
        beforeDelete.description.should.equal(description);
        beforeDelete.importance.should.equal(importance);
        beforeDelete.lightColor.should.equal('#E2E2E2');
        // TODO visibility always -1000 on native - investigate
        // beforeDelete.lockScreenVisibility.should.equal(1);

        // delete
        await firebase.notifications().android.deleteChannel(channelId);

        // confirm deletion
        const afterDelete = await firebase
          .notifications()
          .android.getChannel(channelId);

        should.equal(afterDelete, null);
      }
    });

    it('should create & read multiple channels', async () => {
      if (device.getPlatform() === 'android') {
        const AndroidChannel = firebase.notifications.Android.Channel;

        const name = 'shooby';
        const importance = 5; // MAX
        const channelId = 'fooby';
        const description = 'shooby description';
        const channel0 = new AndroidChannel(
          `${channelId}0`,
          `${name}0`,
          importance
        );
        const channel1 = new AndroidChannel(
          `${channelId}1`,
          `${name}1`,
          importance
        );
        const channel2 = new AndroidChannel(
          `${channelId}2`,
          `${name}2`,
          importance
        );
        channel0.setDescription(description + 0);
        channel1.setDescription(description + 1);
        channel2.setDescription(description + 2);
        channel0.setLightColor('#e2e2e2');
        channel1.setLightColor('#e2e2e2');
        channel2.setLightColor('#e2e2e2');

        // create multiple
        await firebase
          .notifications()
          .android.createChannels([channel0, channel1, channel2]);

        // read multiple
        const beforeDelete = await firebase
          .notifications()
          .android.getChannels();

        beforeDelete.should.be.an.Array();
        beforeDelete.length.should.equal(3);

        for (let i = 0; i < beforeDelete.length; i++) {
          const channel = beforeDelete[i];
          channel.name.should.equal(name + i);
          channel.sound.should.equal('default');
          channel.channelId.should.equal(channelId + i);
          channel.description.should.equal(description + i);
          channel.importance.should.equal(importance);
          channel.lightColor.should.equal('#E2E2E2');

          await firebase
            .notifications()
            .android.deleteChannel(channel.channelId);
        }

        // confirm deletion
        const afterDelete = await firebase
          .notifications()
          .android.getChannels();

        afterDelete.should.be.an.Array();
        afterDelete.length.should.equal(0);
      }
    });
  });
});
