import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
import { pathfinder } from './messages';

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

// TODO: Add wanted middleware parsers

// Middleware to parse a request for the raw path.
let raw = koaProtobuf.protobufParser(X)

// Middleware to parse a request for the adjusted path.
let adjusted = koaProtobuf.protobufParser(X)

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});

// TODO: List of gets
// All based on needs from PF

// get request
router.get('/api/request', (ctx) => {
  ctx.proto = pathfinder.Request.create({
      flyzones:
      obstacles:
      enemy:
      mission:
      overview:
  })
});

// get raw mission data
router.get('/api/raw-mission', (ctx) => {
  ctx.proto = pathfinder.RawMission.create({

  })
});


// TODO: List of posts

// return reponse
router.post('/api/response', response, timeout, async (ctx) => {
  await ctx.pathfind.getAdjustedMission();
  ctx.status = 200;
});


export default router;
