/** Convert radians to degrees. */
export function degrees(radians) {
  return radians * 180 / Math.PI;
}

/** Put degrees in range [0, 360). */
export function modDegrees(degrees) {
  return (degrees % 360 + 360) % 360;
}

/** Put degrees in range (-180, 180]. */
export function modDegrees2(degrees) {
  return -modDegrees(-degrees - 180) + 180;
}

/** Wait for an amount of time. */
export async function wait(milliseconds) {
  return await (new Promise(resolve => setTimeout(resolve, milliseconds)));
}

/** Return a object that can be used for cleanup in timeouts. */
export function cleanupAfter(cleanup, limit, message) {
  let timeoutMessage = message || 'operation timed out';

  let earlyCall = false;
  let earlyErr = null;

  // Store if there was an error or not in the case that the finish
  // function is called before it is overrided below.
  let finish = (err) => {
    earlyCall = true;
    earlyErr = err;
  };

  // Resolves after the cleanup is finished.
  let done = new Promise((resolve, reject) => {
    // Call the finish function if the timeout is reached.
    let waitTimeout = setTimeout(() => {
      finish(Error(timeoutMessage));
    }, limit);

    // Cancel the timeout, cleanup, and mark the operation as
    // complete.
    finish = (err, result) => {
      clearTimeout(waitTimeout);
      cleanup();

      if (err) reject(err);
      else resolve(result);
    };

    if (earlyCall) finish(earlyErr);
  });

  // Async function to wait for the operation to be over and cleaned
  // up.
  let wait = async () => await done;

  return { finish, wait };
}
