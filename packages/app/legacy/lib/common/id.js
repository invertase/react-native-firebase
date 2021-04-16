const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

const AUTO_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// timestamp of last push, used to prevent local collisions if you push twice in one ms.
let lastPushTime = 0;

// we generate 72-bits of randomness which get turned into 12 characters and appended to the
// timestamp to prevent collisions with other clients.  We store the last characters we
// generated because in the event of a collision, we'll use those same characters except
// "incremented" by one.
const lastRandChars = [];

/**
 * Generate a firebase id - for use with ref().push(val, cb) - e.g. -KXMr7k2tXUFQqiaZRY4'
 * @param serverTimeOffset - pass in server time offset from native side
 * @returns {string}
 */
export function generateDatabaseId(serverTimeOffset = 0) {
  const timeStampChars = new Array(8);
  let now = new Date().getTime() + serverTimeOffset;
  const duplicateTime = now === lastPushTime;

  lastPushTime = now;

  for (let i = 7; i >= 0; i -= 1) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    now = Math.floor(now / 64);
  }

  if (now !== 0) {
    throw new Error('We should have converted the entire timestamp.');
  }

  let id = timeStampChars.join('');

  if (!duplicateTime) {
    for (let i = 0; i < 12; i += 1) {
      lastRandChars[i] = Math.floor(Math.random() * 64);
    }
  } else {
    // if the timestamp hasn't changed since last push,
    // use the same random number, but increment it by 1.
    let i;
    for (i = 11; i >= 0 && lastRandChars[i] === 63; i -= 1) {
      lastRandChars[i] = 0;
    }

    lastRandChars[i] += 1;
  }

  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i]);
  }

  if (id.length !== 20) {
    throw new Error('Length should be 20.');
  }

  return id;
}

/**
 * Generate a firestore auto id for use with collection/document .add()
 * @return {string}
 */
export function generateFirestoreId() {
  let autoId = '';

  for (let i = 0; i < 20; i++) {
    autoId += AUTO_ID_CHARS.charAt(Math.floor(Math.random() * AUTO_ID_CHARS.length));
  }
  return autoId;
}
