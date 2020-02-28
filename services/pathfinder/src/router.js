import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
import { telemetry } from './messages';

// router: "routes" server endpoints, gotta make 4 routers for the pathfinder
//takes messages from proto and puts it into nsfw
//messages have the info, and we gotta put this info right places

let router = new Router(); // creates new router instance

router.use(koaProtobuf.protobufSender()); // encodes outbound message as protobuff

//timeout error handling
let timeout = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(err.message);
    ctx.status = 504; //504 is gateway timeout
  }
};

//middleware - the software that connects network-based requests generated
//by a client to the back-end data the client is requesting

//middleware to parse a request to add an enemy waypoint
let addEnemyWaypoint = koaProtobuf.protobufParser(pathfinder.Request);

//middleware to parse a request to remove an enemy waypoint
let removeEnemyWaypoint = koaProtobuf.protobufParser(pathfinder.Request);

router.get('/api/alive', (ctx) => { //is this to check somethin?
  ctx.body = 'Yes, I\'m alive\n';
});

//_runPathfinder
router.get('api/run-pathfinder', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._runPathfinder();
});

//_runVehicleAvoid
router.get('api/run-vehicle-avoid', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._runVehicleAvoid();
});

//_addEnemyWaypoint
router.get('api/add-enemy-waypoint', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._addEnemyWaypoint();
});

router.post('api/add-enemy-waypoint', addEnemyWaypoint, timeout, async (ctx) => {
await ctx.nsfw._addEnemyWaypoint(ctx.request.proto);
ctx.status = 200; //200 means okay
});

//_removeEnemyWaypoint
router.get('api/remove-enemy-waypoint', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._removeEnemyWaypoint();
});

router.post('api/remove-enemy-waypoint', removeEnemyWaypoint, timeout, async (ctx) => {
await ctx.nsfw._removeEnemyWaypoint(ctx.request.proto);
ctx.status = 200;
});

//make response stuff to output
// goal of porting flyzone to flyzone list



export default router;

//get WPs from pixhawk through telemetry
//make a router for flyzone, obstacle, plane, etc
