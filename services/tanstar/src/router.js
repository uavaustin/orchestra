import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
// import { pathfinder } from './messages';

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

//let pf = koaProtobuf.protobufParser(pathfinder);

// Middleware to parse a request for the raw path.
//let request = koaProtobuf.protobufParser(pathfinder.Request);

// Middleware to parse a request for the adjusted path.
//let adjusted = koaProtobuf.protobufParser(pathfinder.AdjustedPath);

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});

/*


// !! Will deprecate with more robust proto messages later
router.put('/api/request', request, timeout, async (ctx) => {
  await ctx.PathAdjust.set(ctx.request.proto);
  ctx.status = 200
});



// !! Will deprecate with more robust proto messages later
router.get('/api/response', async (ctx) => {
  const adjusted = await ctx.PathAdjust.getAdjusted();

  ctx.proto = pathfinder.Response.create({
    success: True,
    adjusted
  });
});


router.get('/api/adjusted-mission', async (ctx) => {
  const adjusted = await ctx.PathAdjust.getAdjusted();

  // TODO: Update protos for more reponse patterns
  //ctx.proto = pathfinder.Response.create({
  //  success: True,
  //  adjusted
  //});
});

*/

export default router;
