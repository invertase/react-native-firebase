/* eslint-disable no-await-in-loop */

function createChannelForGroup(groupId) {
  const AndroidChannel = firebase.notifications.Android.Channel;
  const name = 'shooby';
  const importance = 5; // MAX
  const channelId = 'fooby';
  const description = 'shooby description';
  const channel = new AndroidChannel(channelId, name, importance);
  channel.setDescription(description);
  channel.setLockScreenVisibility(1);
  channel.setLightColor('#e2e2e2');
  channel.setGroup(groupId);
  return channel;
}

describe.only('notifications() - Android Only', () => {
  describe('NotificationChannelGroup', () => {
    it('should create, read & delete a channel group', async () => {
      if (device.getPlatform() === 'android') {
        const groupId = 'foobyGroup';
        const groupName = 'shoobyGroup';
        const channelForGroup = createChannelForGroup(groupId);
        const AndroidChannelGroup = firebase.notifications.Android.ChannelGroup;

        const group = new AndroidChannelGroup(groupId, groupName);

        // create group
        await firebase.notifications().android.createChannelGroup(group);

        // create channel for group
        await firebase.notifications().android.createChannel(channelForGroup);

        // read group
        const beforeDelete = await firebase
          .notifications()
          .android.getChannelGroup(groupId);

        beforeDelete.name.should.equal(groupName);
        beforeDelete.groupId.should.equal(groupId);

        // validate group.channels exists
        beforeDelete.channels.should.be.an.Array();
        beforeDelete.channels.length.should.equal(1);
        beforeDelete.channels[0].sound.should.equal('default');
        beforeDelete.channels[0].description.should.equal(
          channelForGroup.description
        );
        beforeDelete.channels[0].importance.should.equal(
          channelForGroup.importance
        );
        beforeDelete.channels[0].lightColor.should.equal('#E2E2E2');

        // delete
        await firebase.notifications().android.deleteChannelGroup(groupId);

        // confirm deletion
        const afterDelete = await firebase
          .notifications()
          .android.getChannelGroup(groupId);

        should.equal(afterDelete, null);
      }
    });

    xit('should create & read multiple channel groups', async () => {
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
