import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

let router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Yo dude, I\'m good.\n';
});

router.get('/api/upload-rate', (ctx) => {
  ctx.proto = ctx.uploadMonitor.getUploadRate();
});

router.get('/api/teams', (ctx) => {
  ctx.proto = null;
});

export default router;
