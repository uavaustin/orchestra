import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
import { telemetry } from './messages';

// router: "routes" server endpoints, gotta make 4 routers for the pathfinder
//takes messages from proto and puts it into nsfw
//messages have the info, and we gotta put this info right places

let router = new Router(); // creates new router instance

router.use(koaProtobuf.protobufSender()); // encodes outbound message as protobuff

// error handler - rename
let timeout = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(err.message);
    ctx.status = 504; //504 is gateway timeout
  }
};

// put  real timeout

//middleware - the software that connects network-based requests generated
//by a client to the back-end data the client is requesting

//middleware for nsfw.proto
let requestNSFW = koaProtobuf.protobufParser(nsfw.Request);
let responseNSFW = koaProtobuf.protobufParser(nsfw.Response);

//middleware to parse a request for Pathfinder or Vehicle Avoid
let requestPF = koaProtobuf.protobufParser(pathfinder.Request);
let respondPF = koaProtobuf.protobufParser(pathfinder.Response);

let requestVA = koaProtobuf.protobufParser(interop.Teams.Team.TeamTelem); // need other plane data
let respondVA = koaProtobuf.protobufParser(interop.Teams);

router.get('/api/alive', (ctx) => { //is this to check somethin?
  ctx.body = 'Yes, I\'m alive\n';
});

router.get('api/add-enemy-waypoint', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._getRequestPF();
});

router.post('api/request-PF', requestPF, timeout, async (ctx) => {
await ctx.nsfw._setRequestPF(ctx.request.proto);
ctx.status = 200; //200 means okay
});















router.get('api/run-pathfinder', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._runPathfinder();
});

router.get('api/run-vehicle-avoid', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._runVehicleAvoid();
});

router.get('api/add-enemy-waypoint', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._addEnemyWaypoint();
});

router.post('api/request-PF', requestPF, timeout, async (ctx) => {
await ctx.nsfw._setRequestPF(ctx.request.proto);
ctx.status = 200; //200 means okay
});

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
