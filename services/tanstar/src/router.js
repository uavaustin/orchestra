import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
//import { pathfinder } from './messages';

const router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

// TODO: Add timeout
let timeout = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(err.message);
    ctx.status = 504;
  }
};

// Middleware to parse a request for the raw path.
let raw = koaProtobuf.protobufParser(X)

// Middleware to parse a request for the adjusted path.
let adjusted = koaProtobuf.protobufParser(X)


router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});

/* Pushes in request data to path-adjust */
// !! Will deprecate with more robust proto messages later
router.put('/api/request', request, timeout, async (ctx) => {
  await ctx.PathAdjust.set(ctx.request.proto);
  ctx.status = 200
});


/* Returns response proto from path-adjust, pathfinder */
// !! Will deprecate with more robust proto messages later
router.get('/api/response', async (ctx) => {
  const adjusted = await ctx.PathAdjust.getAdjusted();

  //ctx.proto = pathfinder.Response.create({
  //  success: True,
  //  adjusted
  //});
});

// This was my first attempt at fixing lines 35-50, but I know it's very wrong
// so I commented it out.
// Need to find correct way to unwrap protobufs, find right way to set plane
// field, find right way to set rawPath field
/*
router.put('/api/request', Request, timeout, (ctx) => {
  const new_request = ctx.Pathfinder.create({
    flyzone: ctx.request.flyzones,
    obstacles: ctx.request.obstacles,
    plane: ctx.request.overview,
    rawPath: ct.request.mission
  })
  await ctx.PathAdjust.set(new_request.flyzone,new_request.obstacle,new_request.plane,new_request.rawPath);

  const adjusted = await ctx.PathAdjust.getAdjusted();

  ctx.proto = pathfinder.Response.create({
    success: True,
    adjusted
  })
});
*/

/* Pushes in flyzones data to path-adjust */
///router.get('/api/flyzones', (ctx) => {
//});


/* Pushes in obstacles data to path-adjust */
///router.get('/api/obstacles', (ctx) => {
//});

/* Pushes in plane location data to path-adjust */
///router.get('/api/plane', (ctx) => {
//});

/* Pushes in raw mission to path-adjust */
///router.get('/api/obstacles', (ctx) => {
//});

/* Returns adjusted mission data proto */
router.get('/api/adjusted-mission', async (ctx) => {
  const adjusted = await ctx.PathAdjust.getAdjusted();

  // TODO: Update protos for more reponse patterns
  //ctx.proto = pathfinder.Response.create({
  //  success: True,
  //  adjusted
  //});
});

export default router;
