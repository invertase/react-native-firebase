/* eslint-disable import/extensions,import/no-unresolved,import/first,import/no-extraneous-dependencies,no-console */
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

import React, { Component } from 'react';
import { AppRegistry, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/ml-natural-language';
let id = 0;

class Root extends Component {
  smartReplyConversation = firebase.mlKitLanguage().newSmartReplyConversation();
  state = {
    messages: [
      {
        _id: id++,
        text: 'React Native Firebase -> ML Kit Smart Replies',
        system: false,
        user: {
          _id: 987,
          name: 'R',
          avatar:
            'https://camo.githubusercontent.com/e7a14b9a151d9b1d23a0d05dac1af86b0e972714/68747470733a2f2f692e696d6775722e636f6d2f4a497942744b572e706e67',
        },
      },
    ],
    suggestions: [],
  };

  constructor(props) {
    super(props);
  }

  onQuickReply = replies => {
    const createdAt = new Date();
    if (replies.length === 1) {
      this.onSend([
        {
          createdAt,
          _id: id++,
          text: replies[0].title,
          user: {
            _id: 234,
          },
        },
      ]);
    } else if (replies.length > 1) {
      this.onSend([
        {
          createdAt,
          _id: id++,
          text: replies.map(reply => reply.title).join(', '),
          user: {
            _id: 234,
          },
        },
      ]);
    } else {
      console.warn('replies param is not set correctly');
    }
  };

  onSend = async messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];
      this.smartReplyConversation.addRemoteUserMessage(
        text,
        createdAt.getTime(),
        user._id + '' || 'testRemoteUser',
      );
    }

    const suggestions = await this.smartReplyConversation.getSuggestedReplies();
    this.setState(prevState => {
      let quickRepliesMessage = null;
      if (suggestions.length) {
        quickRepliesMessage = {
          _id: id++,
          text: '',
          // createdAt: new Date(),
          user: {
            _id: 234,
          },
          quickReplies: {
            type: 'radio',
            values: suggestions.map($ => ({ title: $.text, value: $.text })),
          },
        };
      }
      return {
        messages: quickRepliesMessage
          ? [quickRepliesMessage, ...messages, ...prevState.messages]
          : [...messages, ...prevState.messages],
      };
    });
  };

  render() {
    return (
      <GiftedChat
        inverted
        messages={this.state.messages}
        onQuickReply={this.onQuickReply}
        onSend={this.onSend}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    height: 120,
    marginBottom: 16,
    width: 135,
  },
});

AppRegistry.registerComponent('testing', () => Root);
