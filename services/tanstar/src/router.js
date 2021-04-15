import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
import { pathfinder } from './messages';

//const pathAdjust = require('./path-adjust');
//const adjustor = new pathAdjust;

const router = new Router();

router.use(koaProtobuf.protobufSender());

//let timeout = async (ctx, next) => {
//  try {
//    await next();
//  } catch (err) {
//    logger.error(err.message);
//    ctx.status = 504;
//  }
//};

// Middleware to parse pathfinder messages.
let mission = koaProtobuf.protobufParser(pathfinder.Mission);
let waypoint = koaProtobuf.protobufParser(pathfinder.Waypoint);
let plane = koaProtobuf.protobufParser(pathfinder.Plane);
let field = koaProtobuf.protobufParser(pathfinder.FlightField);
let obstacle = koaProtobuf.protobufParser(pathfinder.Obstacle);
let flyzone = koaProtobuf.protobufParser(pathfinder.Flyzone);

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});

//router.get('/api/pather-alive', async (ctx) => {
//  ctx.body = ctx.pather.getStatus();
//});
router.post('/api/mission', mission, async (ctx) => {
  await ctx.pather.setRawPath(ctx.request.proto);
  ctx.status = 200;
});

router.get('/api/mission', async (ctx) => {
  const mission = await ctx.pather.getRawPath();
  ctx.proto = pathfinder.Mission.create({
    time: Date.now(),
    waypoints: mission.waypoints
  });
});

router.get('/api/adjusted', async (ctx) => {
  await ctx.pather.setRawPath(ctx.request.proto);
  await ctx.pather.transformPath();
  const adjusted = await ctx.pather.getAdjusted();
  ctx.proto = pathfinder.Mission.create({
    time: Date.now(),
    waypoints: adjusted.waypoints
  });
});

router.post('/api/plane', plane, async (ctx) => {
  await ctx.pather.setPlane(ctx.request.proto);
  ctx.status = 200;
});

router.get('/api/plane', async (ctx) => {
  const plane = await ctx.pather.getPlane();
  ctx.proto = pathfinder.Plane.create({
    time: Date.now(),
    pos: plane.pos,
    altitude: plane.altitude
  });
});

router.post('/api/flight-field', field, async (ctx) => {
  await ctx.pather.setFlightField(ctx.request.proto);
  ctx.status = 200;
});

router.get('/api/flight-field', async (ctx) => {
  const flyz = await ctx.pather.getFlyzones();
  const obstac = await ctx.pather.getObstacles();
  ctx.proto = pathfinder.FlightField.create({
    time: Date.now(),
    flyzones: flyz,
    obstacles: obstac
  });
});

//router.get('/api/field', timeout, async (ctx) => {
//  ctx.proto = await ctx.pather.getField();
//});

export default router;
