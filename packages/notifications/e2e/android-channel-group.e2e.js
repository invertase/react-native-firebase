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

let validate;

describe('notifications() Notification', () => {
  before(() => {
    validate = jet.require('../packages/notifications/lib/validateAndroidChannelGroup.js');
    console.log(validate);
  });

  it('throws if not an object', () => {
    try {
      validate(123);
      return Promise.reject(new Error('Did not throw Error'));
    } catch (e) {
      e.message.should.containEql("'group' expected an object value");
      return Promise.resolve();
    }
  });

  describe('channelGroupId', () => {
    it('throws if not a string', () => {
      try {
        validate({
          channelGroupId: 1123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'group.channelGroupId' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if not a valid string', () => {
      try {
        validate({
          channelGroupId: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'group.channelGroupId' expected a string value");
        return Promise.resolve();
      }
    });
  });

  describe('name', () => {
    it('throws if not a string', () => {
      try {
        validate({
          channelGroupId: 'foo',
          name: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'group.name' expected a string value");
        return Promise.resolve();
      }
    });

    it('throws if not a valid string', () => {
      try {
        validate({
          channelGroupId: 'foo',
          name: '',
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'group.name' expected a string value");
        return Promise.resolve();
      }
    });
  });

  describe('description', () => {
    it('throws if not a string', () => {
      try {
        validate({
          channelGroupId: 'foo',
          name: 'bar',
          description: 123,
        });
        return Promise.reject(new Error('Did not throw Error'));
      } catch (e) {
        e.message.should.containEql("'group.description' expected a string value");
        return Promise.resolve();
      }
    });

    it('sets a description', () => {
      const v = validate({
        channelGroupId: 'foo',
        name: 'bar',
        description: 'baz',
      });
      v.channelGroupId.should.eql('foo');
      v.name.should.eql('bar');
      v.description.should.eql('baz');
    });
  });

  it('sets values', () => {
    const v = validate({
      channelGroupId: 'foo',
      name: 'bar',
    });
    v.channelGroupId.should.eql('foo');
    v.name.should.eql('bar');
    Object.keys(v).length.should.eql(2);
  });
});
