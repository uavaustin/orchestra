import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import { telemetry } from './messages';

let router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yes, I\'m alive!\n';
});

router.get('/api/interop-telem', (ctx) => {
  ctx.proto = ctx.plane.getInteropTelem();
});

router.get('/api/camera-telem', (ctx) => {
  ctx.proto = ctx.plane.getCameraTelem();
});

router.get('/api/overview', (ctx) => {
  ctx.proto = ctx.plane.getOverview();
});

router.get('/api/raw-mission', async (ctx) => {
  try {
    ctx.proto = await ctx.plane.getRawMission();
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

let missionParser =
  koaProtobuf.protobufParser(telemetry.RawMission);

router.post('/api/raw-mission', missionParser, async (ctx) => {
  try {
    await ctx.plane.setRawMission(ctx.request.proto);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

router.get('/api/mission-current', async (ctx) => {
  try {
    ctx.proto = await ctx.plane.getMissionCurrent();
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

let missionCurrentParser =
  koaProtobuf.protobufParser(telemetry.MissionCurrent);

router.post('/api/mission-current', missionCurrentParser, async (ctx) => {
  try {
    await ctx.plane.setMissionCurrent(ctx.request.proto);
    ctx.status = 200;
  } catch (err) {
    console.error(err);
    ctx.status = 504;
  }
});

export default router;
