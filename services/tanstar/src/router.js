import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

const router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yep, I am alive.\n';
});


export default router;
