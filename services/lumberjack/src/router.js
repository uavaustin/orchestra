import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

let router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yo dude, I\'m good.\n';
});

router.get('/api/clear-data', (ctx) => {
  ctx.body = ctx.service.clearData();
});

export default router;
