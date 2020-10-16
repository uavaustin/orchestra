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

router.get('/test', funct)

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});

// TODO: List of gets
// All based on needs from PF

// get adjusted mission data
router.get('/api/adjusted-mission', (ctx) => {
  const adjusted = await ctx.PathAdjust.getAdjusted();

  ctx.proto = pathfinder.Response.create({
    success: True,
    adjusted
  });
});


// TODO: List of posts




export default router;
