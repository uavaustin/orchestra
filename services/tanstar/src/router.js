import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import logger from './common/logger';
import { pathfinder } from './messages';

const router = new Router();

router.use(koaProtobuf.protobufSender());

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


export default router;
