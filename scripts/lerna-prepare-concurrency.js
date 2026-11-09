// Prints the --concurrency value for `yarn lerna:prepare`.
//
// Each prepare task runs `bob build` (tsc + babel) and can hold well over 1 GiB,
// on top of Yarn and Lerna themselves during `yarn install`. Running one task per
// CPU on a many-core, low-memory machine (a 16-CPU / 8 GiB Linux VM or container)
// gets the install killed by the kernel OOM killer.
const os = require('os');

const MEMORY_PER_TASK_BYTES = 2.5 * 1024 ** 3;

function cpuCount() {
  return typeof os.availableParallelism === 'function'
    ? os.availableParallelism()
    : os.cpus().length;
}

// process.constrainedMemory() reports a cgroup memory limit; it returns 0 (or a
// huge number) when there is none.
function memoryBytes({
  total = os.totalmem(),
  constrained = typeof process.constrainedMemory === 'function' ? process.constrainedMemory() : 0,
} = {}) {
  return constrained > 0 && constrained < total ? constrained : total;
}

function lernaPrepareConcurrency({
  override = process.env.RNFB_LERNA_CONCURRENCY,
  cpus = cpuCount(),
  memory = memoryBytes(),
} = {}) {
  if (typeof override === 'string' && /^[1-9][0-9]*$/.test(override)) {
    return Number(override);
  }
  return Math.max(1, Math.min(cpus, Math.floor(memory / MEMORY_PER_TASK_BYTES)));
}

module.exports = { lernaPrepareConcurrency, memoryBytes, MEMORY_PER_TASK_BYTES };

if (require.main === module) {
  process.stdout.write(`${lernaPrepareConcurrency()}\n`);
}
