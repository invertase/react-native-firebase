const net = require('net');
const {
  failIfForeignListener,
  lsofListenPidsOrNull,
  tcpPortAccepts,
} = require('../../../tests/e2e/foreignListener');

function listen() {
  const server = net.createServer().listen(0, '127.0.0.1');
  return new Promise(resolve =>
    server.once('listening', () => resolve({ server, port: server.address().port })),
  );
}

describe('foreignListener', function () {
  it('tcpPortAccepts is true for a listening port and false once it closes', async function () {
    const { server, port } = await listen();
    expect(await tcpPortAccepts(port)).toBe(true);
    await new Promise(resolve => server.close(resolve));
    expect(await tcpPortAccepts(port)).toBe(false);
  });

  it('throws when the port keeps accepting and lsof attributes no listener', async function () {
    await expect(
      failIfForeignListener(8090, 'probe', {
        graceMs: 50,
        listPids: () => [],
        accepts: async () => true,
      }),
    ).rejects.toThrow(
      /127\.0\.0\.1:8090 accepts connections but has no listener lsof can attribute/,
    );
  });

  it('returns for an own listener, a closed port, or an lsof that cannot answer', async function () {
    let accepted = 0;
    const accepts = async () => {
      accepted += 1;
      return true;
    };
    await failIfForeignListener(8090, 'own', { graceMs: 50, listPids: () => ['123'], accepts });
    await failIfForeignListener(8090, 'no-lsof', { graceMs: 50, listPids: () => null, accepts });
    expect(accepted).toBe(0);
    await failIfForeignListener(8090, 'closed', {
      graceMs: 50,
      listPids: () => [],
      accepts: async () => false,
    });
  });

  it('returns when our own listener binds during the grace period', async function () {
    let calls = 0;
    await failIfForeignListener(8090, 'bind-race', {
      graceMs: 50,
      listPids: () => (++calls > 1 ? ['456'] : []),
      accepts: async () => true,
    });
    expect(calls).toBe(2);
  });

  it('lsofListenPidsOrNull is null when lsof is not on PATH', function () {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-no-lsof-'));
    try {
      expect(lsofListenPidsOrNull(8090, { ...process.env, PATH: empty })).toBeNull();
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });

  it('lsofListenPidsOrNull sees this process listening', async function () {
    const { server, port } = await listen();
    try {
      const pids = lsofListenPidsOrNull(port);
      if (pids !== null) {
        expect(pids).toContain(String(process.pid));
      }
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });
});
