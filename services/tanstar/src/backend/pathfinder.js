// wrapper node file for PF library functionality

// This is tentative! This setup is subject to change depending on the auto-generated
// porting code on the Rust side, especially the types returned and parameters.

export default class Pathfinder {
  // Creates a blank Pathfinder
  constructor(/*flyzone, obstacles, plane, rawPath*/) {
    throw new Error("Not implemented.");
  }

  // Sets the flyzones and obstacles
  setField(/*flyzones, obstacles*/) {
    throw new Error("Not implemented.");
  }

  // Sets the plane telemetry
  // getAdjustedPath must be run for the path to be updated.
  setPlane(/*plane*/) {
    throw new Error("Not implemented.");
  }

  // Sets the raw path
  // getAdjustedPath must be run for the path to be optimized.
  setRawPath(/*path*/) {
    throw new Error("Not implemented.");
  }

  // Runs the pathfinder and returns the adjusted path
  // Might return Error if no raw path is provided.
  getAdjustedPath() {
    throw new Error("Not implemented.");
  }
}