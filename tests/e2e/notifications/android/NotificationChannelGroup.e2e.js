/* eslint-disable no-await-in-loop */

function createChannelForGroup(groupId) {
  const AndroidChannel = firebase.notifications.Android.Channel;
  const name = 'shooby';
  const importance = 5; // MAX
  const channelId = `fooby${groupId}`;
  const description = 'shooby description';
  const channel = new AndroidChannel(channelId, name, importance);
  channel.setDescription(description);
  channel.setLockScreenVisibility(1);
  channel.setLightColor('#e2e2e2');
  channel.setGroup(groupId);
  return channel;
}

describe('notifications() - Android Only', () => {
  describe('NotificationChannelGroup', () => {
    it('should create, read & delete a channel group', async () => {
      if (device.getPlatform() === 'android') {
        const groupId = `foobyGroup`;
        const groupName = 'Shooby Group';
        const groupDescription = 'A shooby group description';
        const channelForGroup = createChannelForGroup(groupId);
        const AndroidChannelGroup = firebase.notifications.Android.ChannelGroup;

        // ensure it doesn't already exist
        await firebase.notifications().android.deleteChannelGroup(groupId);

        const group = new AndroidChannelGroup(
          groupId,
          groupName,
          groupDescription
        );

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
        beforeDelete.description.should.equal(groupDescription);

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

        // delete group
        await firebase.notifications().android.deleteChannelGroup(groupId);

        // confirm deletion of group
        const afterDelete = await firebase
          .notifications()
          .android.getChannelGroup(groupId);

        should.equal(afterDelete, null);
      }
    });

    it('should create & read multiple channel groups', async () => {
      if (device.getPlatform() === 'android') {
        const groupId0 = `0foobyGroup0`;
        const groupId1 = `1foobyGroup1`;
        const groupName0 = '0Shooby Group0';
        const groupName1 = '1Shooby Group1';
        const groupDescription0 = 'A shooby group description0';
        const groupDescription1 = 'A shooby group description1';
        const channelForGroup0 = createChannelForGroup(groupId0);
        const channelForGroup1 = createChannelForGroup(groupId1);

        const AndroidChannelGroup = firebase.notifications.Android.ChannelGroup;

        // ensure they don't already exist
        // TODO add a multi delete method?
        await firebase.notifications().android.deleteChannelGroup(groupId0);
        await firebase.notifications().android.deleteChannelGroup(groupId1);

        const group0 = new AndroidChannelGroup(
          groupId0,
          groupName0,
          groupDescription0
        );

        const group1 = new AndroidChannelGroup(
          groupId1,
          groupName1,
          groupDescription1
        );

        // create groups
        await firebase
          .notifications()
          .android.createChannelGroups([group0, group1]);

        // create channels for groups
        await firebase
          .notifications()
          .android.createChannels([channelForGroup0, channelForGroup1]);

        // read groups
        const beforeDelete = await firebase
          .notifications()
          .android.getChannelGroups();

        beforeDelete.should.be.a.Array();
        beforeDelete.length.should.be.equal(2);

        beforeDelete[0].name.should.equal(groupName0);
        beforeDelete[0].groupId.should.equal(groupId0);
        beforeDelete[0].description.should.equal(groupDescription0);
        beforeDelete[1].name.should.equal(groupName1);
        beforeDelete[1].groupId.should.equal(groupId1);
        beforeDelete[1].description.should.equal(groupDescription1);

        // validate group.channels exists
        beforeDelete[0].channels.should.be.an.Array();
        beforeDelete[0].channels.length.should.equal(1);
        beforeDelete[0].channels[0].sound.should.equal('default');
        beforeDelete[0].channels[0].description.should.equal(
          channelForGroup0.description
        );
        beforeDelete[0].channels[0].importance.should.equal(
          channelForGroup0.importance
        );
        beforeDelete[0].channels[0].lightColor.should.equal('#E2E2E2');

        beforeDelete[1].channels.should.be.an.Array();
        beforeDelete[1].channels.length.should.equal(1);
        beforeDelete[1].channels[0].sound.should.equal('default');
        beforeDelete[1].channels[0].description.should.equal(
          channelForGroup1.description
        );
        beforeDelete[1].channels[0].importance.should.equal(
          channelForGroup1.importance
        );
        beforeDelete[1].channels[0].lightColor.should.equal('#E2E2E2');

        // delete group
        // TODO add a multi delete method?
        await firebase.notifications().android.deleteChannelGroup(groupId0);
        await firebase.notifications().android.deleteChannelGroup(groupId1);

        // confirm deletion of groups
        const afterDelete = await firebase
          .notifications()
          .android.getChannelGroups();

        afterDelete.length.should.equal(0);
      }
    });
  });
});
