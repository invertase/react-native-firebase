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

// describe('database().ref().onDisconnect()', () => {
//   describe('cancel', () => {
//     it('cancels all previous events', async () => {
//       const ref = firebase.database().ref('on-disconnect-cancel');
//       await ref.set('foobar');
//       await ref.onDisconnect().set(Date.now());
//       await ref.onDisconnect().cancel();
//       await firebase.database().goOffline();
//       await firebase.database().goOnline();
//       const snapshot = await ref.once('value');
//       snapshot.val().should.equal('foobar');
//     });
//   });
// });
