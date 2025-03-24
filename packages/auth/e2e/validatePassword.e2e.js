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

describe('auth() -> validatePassword()', function () {
    it('throws if password is not a string', async function () {
        try {
        await firebase.auth().validatePassword(123456);
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value");
        return Promise.resolve();
        }
    });
    
    it('throws if password is an empty string', async function () {
        try {
        await firebase.auth().validatePassword('');
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a non-empty string value");
        return Promise.resolve();
        }
    });
    
    it('throws if password is less than 6 characters', async function () {
        try {
        await firebase.auth().validatePassword('12345');
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value of at least 6 characters in length");
        return Promise.resolve();
        }
    });
    
    it('throws if password is greater than 128 characters', async function () {
        try {
        await firebase.auth().validatePassword('123456'.repeat(22));
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value of at most 128 characters in length");
        return Promise.resolve();
        }
    });
    
    it('throws if password does not contain at least one lowercase character', async function () {
        try {
        await firebase.auth().validatePassword('PASSWORD123');
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value containing at least one lowercase character");
        return Promise.resolve();
        }
    });
    
    it('throws if password does not contain at least one uppercase character', async function () {
        try {
        await firebase.auth().validatePassword('password123');
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value containing at least one uppercase character");
        return Promise.resolve();
        }
    });
    
    it('throws if password does not contain at least one numeric character', async function () {
        try {
        await firebase.auth().validatePassword('Password');
        return Promise.reject(new Error('Did not throw Error.'));
        } catch (error) {
        error.message.should.containEql("'password' expected a string value containing at least one numeric character");
        return Promise.resolve();
        }
    });
});