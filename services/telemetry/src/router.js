import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import { telemetry } from './messages';

let router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

// Check if enough telemetry has been received for the service to be
// available.
router.use(async (ctx, next) => {
  if (ctx.plane.state.isPopulated()) {
    await next();
  } else {
    ctx.status = 503;
  }
});

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yes, I\'m alive!\n';
});

router.get('/api/interop-telem', (ctx) => {
  ctx.proto = ctx.plane.state.getInteropTelemProto();
});

router.get('/api/camera-telem', (ctx) => {
  ctx.proto = ctx.plane.state.getCameraTelemProto();
});

router.get('/api/overview', (ctx) => {
  ctx.proto = telemetry.Overview.create({
    pos: ctx.plane.state.getPositionProto(),
    rot: ctx.plane.state.getRotationProto(),
    alt: ctx.plane.state.getAltitudeProto(),
    vel: ctx.plane.state.getVelocityProto(),
    speed: ctx.plane.state.getSpeedProto(),
    battery: ctx.plane.state.getBatteryProto(),
    mode: ctx.plane.state.mode
  });
});

router.get('/api/raw-mission', async (ctx) => {
  try {
    ctx.proto = await ctx.plane.requestMission();
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

let missionParser = koaProtobuf.protobufParser(telemetry.RawMission);

router.post('/api/raw-mission', missionParser, async (ctx) => {
  try {
    await ctx.plane.sendMission(ctx.request.proto);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

router.get('/api/current-waypoint', async (ctx) => {
  try {
    let seq = await ctx.plane.getCurrentWaypoint();

    // FIXME: Use a protobuf message instead.
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({ seq: seq });
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

router.post('/api/currrent-waypoint', async (ctx) => {
  // FIXME: Use a protobuf message instead. Currently blindly
  //        trusting that a JSON body was sent with a seq key.
  let seq = JSON.parse(ctx.request.body).seq;

  try {
    await ctx.plane.setCurrentWaypoint(seq);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

export default router;
