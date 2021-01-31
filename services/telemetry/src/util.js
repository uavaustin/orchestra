/** Convert radians to degrees. */
export function degrees(radians) {
  return radians * 180 / Math.PI;
}

/** Put degrees in range [0, 360). */
export function modDegrees360(degrees) {
  return (degrees % 360 + 360) % 360;
}

/** Put degrees in range (-180, 180]. */
export function modDegrees180(degrees) {
  return -modDegrees360(-degrees - 180) + 180;
}

/** Return a object that can be used for cleanup in timeouts. */
export function cleanupAfter(cleanup, limit, message) {
  let timeoutMessage = message || 'operation timed out';

  let earlyCall = false;
  let earlyErr = null;
  let cleanupObj = {};

  // Store if there was an error or not in the case that the finish
  // function is called before it is overrided below.
  cleanupObj.finish = (err) => {
    earlyCall = true;
    earlyErr = err;
  };

  cleanupObj.wait = async () => {
    // Resolves after the cleanup is finished.
    let done = new Promise((resolve, reject) => {
      // Call the finish function if the timeout is reached.
      let waitTimeout = setTimeout(() => {
        cleanupObj.finish(Error(timeoutMessage));
      }, limit);

      // Cancel the timeout, cleanup, and mark the operation as
      // complete.
      cleanupObj.finish = (err, result) => {
        clearTimeout(waitTimeout);
        cleanup();

        if (err) reject(err);
        else resolve(result);
      };

      if (earlyCall) cleanupObj.finish(earlyErr);
    });
    return await done;
  };

  return cleanupObj;
}
