package io.invertase.firebase.database;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;


public class RNFirebaseTransactionHandler {
  private final ReentrantLock lock;
  private final Condition condition;
  private Map<String, Object> data;
  private volatile boolean isReady;

  public Object value;
  public boolean interrupted;
  public boolean abort = false;

  RNFirebaseTransactionHandler() {
    lock = new ReentrantLock();
    condition = lock.newCondition();
  }

  /**
   * Signal that the transaction data has been received
   *
   * @param updateData
   */
  public void signalUpdateReceived(Map<String, Object> updateData) {
    lock.lock();

    abort = (Boolean) updateData.get("abort");
    value = updateData.get("value");

    try {
      if (isReady)
        throw new IllegalStateException("This transactionUpdateCallback has already been called.");
      data = updateData;
      isReady = true;
      condition.signalAll();
    } finally {
      lock.unlock();
    }
  }

  /**
   * Wait for transactionUpdateReceived to signal condition
   * @throws InterruptedException
   */
  void await() throws InterruptedException {
    lock.lock();
    Boolean notTimedOut = false;

    try {
      while (!notTimedOut && !isReady) {
         notTimedOut = condition.await(30, TimeUnit.SECONDS);
      }
    } finally {
      lock.unlock();
    }
  }

  /**
   * Get the
   * @return
   */
  Map<String, Object> getUpdates() {
    return data;
  }
}
