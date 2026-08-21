#!/usr/bin/env python3
"""Start a command in a new session and wait (setsid(2) + waitpid).

macOS has no setsid(1). util-linux `setsid -w` is the Linux equivalent:
the parent stays in the original session so stdout remains on the inherited
fd (tee/file); the child calls setsid(2) then execs so it is not in the
agent shell process group.
"""
from __future__ import annotations

import os
import sys


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        sys.stderr.write("usage: exec-new-session.py command [args...]\n")
        return 2

    pid = os.fork()
    if pid == 0:
        os.setsid()
        try:
            os.execvp(argv[1], argv[1:])
        except OSError as exc:
            sys.stderr.write(f"exec-new-session.py: execvp {argv[1]!r}: {exc}\n")
            os._exit(127)

    _waited_pid, status = os.waitpid(pid, 0)
    if os.WIFEXITED(status):
        return os.WEXITSTATUS(status)
    if os.WIFSIGNALED(status):
        signo = os.WTERMSIG(status)
        # Propagate the same signal to match setsid -w / exec semantics.
        os.kill(os.getpid(), signo)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
