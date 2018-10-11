import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import { imagery, stats } from './messages';

const router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Howdy.\n';
});

router.get('/api/count', (ctx) => {
  ctx.proto = imagery.ImageCount.create({
    time: Date.now() / 1000,
    count: ctx.imageStore.getCount()
  });
});

router.get('/api/available', (ctx) => {
  // For now, just return a list from 0 to count - 1 until there's a
  // proper solution of storing images and so other services can stop
  // expecting the behavior of just using the count to get images.
  ctx.proto = imagery.AvailableImages.create({
    time: Date.now() / 1000,
    count: ctx.imageStore.getCount(),
    id_list: Array.from(Array(ctx.imageStore.getCount()).keys())
  });
});

router.get('/api/capture-rate', (ctx) => {
  // Returning the rate that images are being captured.
  ctx.proto = stats.ImageCaptureRate.create({
    time: Date.now() / 1000,
    rate_5: ctx.imageStore.getRate()
  });
});

router.get('/api/image/latest', async (ctx) => {
  // To get the latest image, get the last image id registered. If
  // there are no images at all, 404.
  const count = ctx.imageStore.getCount();

  if (count === 0) {
    ctx.status = 404;
  } else {
    ctx.proto = await getImageMessage(ctx.imageStore, count - 1);
  }
});

router.get('/api/image/next', async (ctx) => {
  // Wait until the image store broadcasts it has a new image, and
  // then we'll send that image.
  const id = await new Promise((resolve) => {
    return ctx.imageStore.once('image', resolve);
  });

  ctx.proto = await getImageMessage(ctx.imageStore, id);
});

router.get('/api/image/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);

  // 404 if this image doesn't exist.
  if (Number.isNaN(id) || id < 0 || id >= ctx.imageStore.getCount()) {
    ctx.status = 404;
  } else {
    ctx.proto = await getImageMessage(ctx.imageStore, id);
  }
});

async function getImageMessage(imageStore, id) {
  const msg = await imageStore.getMetadata(id);
  msg.image = await imageStore.getImage(id);

  return msg;
}

export default router;
