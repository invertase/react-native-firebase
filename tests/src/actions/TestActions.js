export const TEST_SET_SUITE_STATUS: string = 'TEST_SET_SUITE_STATUS';
export const TEST_SET_STATUS: string = 'TEST_SET_STATUS';

export function setSuiteStatus({ suiteId, status, time, message, progress }) {
  return {
    type: TEST_SET_SUITE_STATUS,
    suiteId,

    status,
    message,

    time,
    progress,
  };
}

export function setTestStatus({ testId, status, stackTrace, time = 0, message = null }) {
  return {
    type: TEST_SET_STATUS,
    testId,

    status,
    message,
    stackTrace,
    time,
  };
}
