const pf = require("../pathfinder.js");
const pfWraps = require("../pfwrapper.js");

try {
  // Test creation of a Pathfinder
  console.log("Testing Pathfinder creation:");
  // Create a flyzone
  console.log("  Testing flyzone creation with LocationWrappers.");
  var flyzones = [[
    new pfWraps.LocationWrapper(10, 10, 0),
    new pfWraps.LocationWrapper(-10.5, 10, 0),
    new pfWraps.LocationWrapper(-10, -10.5, 0),
    new pfWraps.LocationWrapper(10.5, -10.5, 0.0)
  ]];
  // Create a couple of obstacles
  console.log("  Testing creation of ObstacleWrappers.");
  var obstacles = [
    new pfWraps.ObstacleWrapper(new pfWraps.LocationWrapper(-5, -5, 0), 5, 10),
    new pfWraps.ObstacleWrapper(new pfWraps.LocationWrapper(5.5, 5.5, 0.0), 3.5, 50.5)
  ];
  // Create a plane utilizing defaults for most of its telemetry
  console.log("  Testing creation of PlaneWrapper.");
  var plane = new pfWraps.PlaneWrapper(new pfWraps.LocationWrapper(0, 0, 0));
  // Create a pathfinder utilizing the default config
  console.log("  Testing creation of Pathfinder.");
  var pathfinder = new pf.Pathfinder(flyzones, obstacles, plane);

  console.log();

  console.log("Testing methods.");
  // Pathfinder#setField
  console.log("  Testing Pathfinder#setField.");
  flyzones[0].push(new pfWraps.LocationWrapper(0, 20.5, 0));
  pathfinder.setField(flyzones);
  // Pathfinder#setPlane
  console.log("  Testing Pathfinder#setPlane.");
  var newPlane = new pfWraps.PlaneWrapper(new pfWraps.LocationWrapper(1, 0, 0.01), 0, 0, 0, 0, 0);
  pathfinder.setPlane(newPlane);
  // Pathfinder#getAdjustedPath
  console.log("  Testing Pathfinder#getAdjustedPath:");
  var rawPath = [
    new pfWraps.WaypointWrapper(new pfWraps.LocationWrapper(8, 0, 5), 0.1),
    new pfWraps.WaypointWrapper(new pfWraps.LocationWrapper(5.2, -5, 8), 0.1)
  ];
  var adjustedPath = pathfinder.getAdjustedPath(rawPath);
//  console.log("    Unchanged valid path: ", rawPath == adjustedPath); TODO: Test if correct path is outputted

  console.log("\nDone.");
} catch (e) {
  console.log(e);
}