import koaProtobuf from 'koa-protobuf';
import Router from 'koa-router';

import { imagery, stats } from './messages';

const router = new Router();

// Encode outbound protobuf messages.
router.use(koaProtobuf.protobufSender());

router.get('/api/alive', (ctx) => {
  ctx.body = 'Howdy.\n';
});

router.get('/api/start-capture', async (ctx) => {
  if(!ctx.backend.getActive()){
    await ctx.backend.start();
    ctx.body = 'Image capture started.\n'
  }
  else{
    ctx.body = 'Image capture is already running.\n'
  }
});

router.get('/api/stop-capture', async (ctx) => {
  if(ctx.backend.getActive()){
    await ctx.backend.stop();
    ctx.body = 'Image capture stopped.\n'
  }
  else{
    ctx.body = 'Image capture is not running.\n'
  }
});

router.get('/api/count', async (ctx) => {
  ctx.proto = imagery.ImageCount.create({
    time: Date.now() / 1000,
    count: await ctx.imageStore.getCount()
  });
});

router.get('/api/available', async (ctx) => {
  const id_list = await ctx.imageStore.getAvailable();
  ctx.proto = imagery.AvailableImages.create({
    time: Date.now() / 1000,
    count: id_list.length,
    id_list
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
  const id = await ctx.imageStore.getLatestId();

  if (id === undefined) {
    ctx.status = 404;
  } else {
    ctx.proto = await getImageMessage(ctx.imageStore, id);
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

  // 404 if this image doesn't exist. 410 if it was deleted.
  if (Number.isNaN(id) || !await ctx.imageStore.exists(id)) {
    ctx.status = 404;
  } else if (await ctx.imageStore.deleted(id)) {
    ctx.status = 410;
  } else {
    ctx.proto = await getImageMessage(ctx.imageStore, id);
  }
});

router.delete('/api/image/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);

  // 404 if this image doesn't exist. 410 if it was deleted.
  if (Number.isNaN(id) || !await ctx.imageStore.exists(id)) {
    ctx.status = 404;
  } else if (await ctx.imageStore.deleted(id)) {
    ctx.status = 410;
  } else {
    await ctx.imageStore.deleteImage(id);
    ctx.status = 200;
  }
});

async function getImageMessage(imageStore, id) {
  const msg = await imageStore.getMetadata(id);
  msg.image = await imageStore.getImage(id);

  return msg;
}

export default router;
