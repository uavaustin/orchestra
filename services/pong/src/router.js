import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

const router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yeah, this is kinda meta tho.\n';
});

router.get('/api/ping', (ctx) => {
  ctx.proto = ctx.pingStore.getPing();
});

export default router;
