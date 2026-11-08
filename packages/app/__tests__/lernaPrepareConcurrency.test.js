const { execFileSync } = require('child_process');
const path = require('path');

const {
  lernaPrepareConcurrency,
  memoryBytes,
  MEMORY_PER_TASK_BYTES,
} = require('../../../scripts/lerna-prepare-concurrency');

const GiB = 1024 ** 3;

describe('lerna-prepare-concurrency', function () {
  it('uses one task per CPU when memory allows it', function () {
    expect(lernaPrepareConcurrency({ override: '', cpus: 4, memory: 16 * GiB })).toBe(4);
  });

  it('caps tasks by memory on a many-CPU, low-memory machine', function () {
    expect(lernaPrepareConcurrency({ override: '', cpus: 16, memory: 8 * GiB })).toBe(
      Math.floor((8 * GiB) / MEMORY_PER_TASK_BYTES),
    );
  });

  it('never goes below one task', function () {
    expect(lernaPrepareConcurrency({ override: '', cpus: 8, memory: 1 * GiB })).toBe(1);
  });

  it('uses RNFB_LERNA_CONCURRENCY when it is a positive integer', function () {
    expect(lernaPrepareConcurrency({ override: '12', cpus: 2, memory: 1 * GiB })).toBe(12);
  });

  it('ignores RNFB_LERNA_CONCURRENCY values that are not positive integers', function () {
    for (const override of ['', '0', '07', '-1', '2.5', 'four']) {
      expect(lernaPrepareConcurrency({ override, cpus: 2, memory: 64 * GiB })).toBe(2);
    }
  });

  it('prints a positive integer when run as a script', function () {
    const out = execFileSync(
      process.execPath,
      [path.resolve(__dirname, '../../../scripts/lerna-prepare-concurrency.js')],
      { encoding: 'utf8', env: { ...process.env, RNFB_LERNA_CONCURRENCY: '3' } },
    );
    expect(out).toBe('3\n');
  });
});

describe('lerna-prepare-concurrency memoryBytes', function () {
  it('uses total RAM when there is no cgroup limit', function () {
    expect(memoryBytes({ total: 8 * GiB, constrained: 0 })).toBe(8 * GiB);
  });

  it('uses total RAM when the cgroup reports an unlimited value', function () {
    expect(memoryBytes({ total: 8 * GiB, constrained: 2 ** 64 })).toBe(8 * GiB);
  });

  it('uses total RAM when the cgroup limit is above it', function () {
    expect(memoryBytes({ total: 8 * GiB, constrained: 8 * GiB + 1 })).toBe(8 * GiB);
  });

  it('uses the cgroup limit when it is below total RAM', function () {
    expect(memoryBytes({ total: 8 * GiB, constrained: 3 * GiB })).toBe(3 * GiB);
  });
});
