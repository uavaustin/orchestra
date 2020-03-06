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
//logs the error rather than a timeout handling - bennett
//use set timeout fnc

// put  real timeout

//middleware - the software that connects network-based requests generated
//by a client to the back-end data the client is requesting
//middleware to parse a request for nsfw
let requestNSFW = koaProtobuf.protobufParser(nsfw.Request);
let respondNSFW = koaProtobuf.protobufParser(nsfw.Response);


//middleware for nsfw.proto
let requestNSFW = koaProtobuf.protobufParser(nsfw.Request);
let responseNSFW = koaProtobuf.protobufParser(nsfw.Response);

//middleware to parse a request for Pathfinder or Vehicle Avoid
let requestPF = koaProtobuf.protobufParser(pathfinder.Request);
let respondPF = koaProtobuf.protobufParser(pathfinder.Response);

let requestVA = koaProtobuf.protobufParser(interop.Teams.Team.TeamTelem); // need other plane data
let respondVA = koaProtobuf.protobufParser(interop.Teams);

//checks if service is alive
router.get('/api/alive', (ctx) => {
  ctx.body = 'Yes, I\'m alive\n';
});

//nsfw
router.get('api/request-NSFW', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._getRequestNSFW();
});

router.post('api/request-NSFW', requestNSFW, timeout, async (ctx) => {
await ctx.nsfw._setRequestNSFW(ctx.request.proto);
ctx.status = 200; //200 means okay
});


/*
router.get('api/request-PF', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._getRequestPF();
});

router.post('api/request-PF', requestPF, timeout, async (ctx) => {
await ctx.nsfw._setRequestPF(ctx.request.proto);
ctx.status = 200;
});

router.get('api/request-VA', timeout, async (ctx) => {
  ctx.proto = await ctx.nsfw._getRequestVA();
});

router.post('api/request-VA', requestVA, timeout, async (ctx) => {
await ctx.nsfw._setRequestVA(ctx.request.proto);
ctx.status = 200;
});
*/

export default router;

//notes

//make response stuff to output
// goal of porting flyzone to flyzone list
//everytime u make an async function its a new task - bennett

//api is address, second field is what ur trying to send/recieve,
//middleware are handlers, timeout is a middleware

//get WPs from pixhawk through telemetry
//protos va - 1WP, plane, plane_other
//protos pf - WP list, FZ list, plane, obstacle list
//proto nsfw - mission, FZ list, obstacle list, plane, plane other
