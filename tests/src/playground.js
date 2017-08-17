import React, { Component } from 'react';
import { View, SectionList, Text, Button } from 'react-native';

export default class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bgColor: '#cb2600',
    };
  }

  clickMe = () => {
    if (this.state.bgColor === '#a8139f') {
      this.setState({ bgColor: '#cb2600' });
    } else {
      this.setState({ bgColor: '#a8139f' });
    }
  };

  render() {
    return (
      <View style={{ backgroundColor: this.state.bgColor }}>
        <Text style={{ color: '#fff' }}>Hello</Text>
        <Text style={{ color: '#22ff31' }}>World</Text>
        <Button title="Change to pink" onPress={this.clickMe} />
      </View>
    );
  }
}

const sampleData = {
  somePostId1: {
    title: 'today now',
    timestamp: Date.now(),
    startOfDay: 1502838000,
  },

  somePostId3: {
    title: 'today but older',
    timestamp: Date.now() - 10000000,
    startOfDay: 1502838000,
  },

  somePostId4: {
    title: 'today but even older',
    timestamp: Date.now() - 60000000,
    startOfDay: 1502838000,
  },

  somePostId2: {
    title: 'hello yesterday',
    timestamp: Date.now() - 82000000, // minus 23 hours - just to make it yesterday ;p
    startOfDay: 1502751600, // yesterday  ;p
  },

  somePostId5: {
    title: 'hello yesterday but older',
    timestamp: Date.now() - 82800000, // minus 23 hours - just to make it yesterday ;p
    startOfDay: 1502751600, // yesterday  ;p
  },
};

// export default class PostsScreen extends Component {
//   constructor(props) {
//     super(props);
//     this.ref = null;
//     this.state = {
//       postSections: [],
//     };
//   }
//
//   componentDidMount() {
//     // this.ref = firebase.database().ref('posts');
//     // this.ref.on('value', this._onPostsUpdate);
//     // just fake it to test
//     this._onPostsUpdate({
//       val() {
//         return sampleData;
//       },
//     });
//   }
//
//   componentWillUnmount() {
//     // always unsubscribe from realtime events when component unmounts
//     // if (this.ref) {
//     //   this.ref.off('value', this._onPostsUpdate);
//     // }
//   }
//
//   _onPostsUpdate(snapshot) {
//     const value = snapshot.val() || {};
//     const keys = Object.keys(value);
//     const sections = {};
//
//     // we'll group them now by date
//     for (let i = 0, len = keys.length; i < len; i++) {
//       const key = keys[i];
//       const post = value[key];
//
//       // assuming post will have a 'timestamp' field and a `startOfDay` field
//       // start of day can be calculated as above `startOfToday`
//
//       if (!sections[post.startOfDay]) {
//         sections[post.startOfDay] = {
//           title: 'Header - I will leave this up to you', // todo today/yesterday/3 days ago etc
//           // will use this later to sort the sections so today is on top
//           key: post.startOfDay,
//           data: [],
//         };
//       }
//
//       const data = Object.assign({ key }, post);
//       // add a post to a specific section date
//       // we'll push/unshift depending on the date, so they' appear in order
//       if (!sections[post.startOfDay].data.length) {
//         // array is empty so nothing to compare sort, just push it
//         sections[post.startOfDay].data.push(data);
//       } else {
//         const previousTimestamp = sections[post.startOfDay].data[sections[post.startOfDay].data.length - 1].timestamp;
//         if (previousTimestamp < data.timestamp) sections[post.startOfDay].data.unshift(data);
//         else sections[post.startOfDay].data.push(data);
//       }
//     }
//
//     this.setState({
//       postSections: Object.values(sections).sort((a, b) => a.key > b.key).reverse(),
//     });
//   }
//
//   _renderSectionItem = ({ item }) => {
//     // todo your custom section item component
//     // return (
//     //   <EventCell
//     //     userName={item.userName}
//     //     postTitle={item.postTitle}
//     //   />
//     // );
//
//     return <Text>{`${item.title} - ${item.timestamp}`}</Text>;
//   };
//
//   _renderSectionHeader = ({ section }) => {
//     // todo your custom section header
//     return (
//       <Text style={{ backgroundColor: '#000', color: '#fff' }}>{section.title}</Text>
//     );
//   };
//
//   render() {
//     return (
//       <SectionList
//         sections={this.state.postSections}
//         renderItem={this._renderSectionItem}
//         renderSectionHeader={this._renderSectionHeader}
//       />
//     );
//   }
// }
