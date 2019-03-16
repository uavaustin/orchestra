import path from 'path';

import { readFile } from 'fs-extra';
import lolex from 'lolex';

import { imagery } from '../src/messages';

import ImageStore from '../src/image-store';

let shapes;

beforeAll(async() => {
  shapes = [];

  for (let i = 0; i < 3; i++) {
    const filename = path.join(__dirname, `fixtures/shape-${i}.jpg`);
    shapes[i] = await readFile(filename, { encoding: null });
  }
});

test('create an empty image store', async () => {
  const imageStore = new ImageStore();
  await imageStore.setup();

  expect(await imageStore.getCount()).toEqual(0);
  expect(await imageStore.exists(1)).toEqual(false);
});

test('images can be added to the image store', async () => {
  const imageStore = new ImageStore(true);
  await imageStore.setup();

  const id1 = await imageStore.addImage(
    shapes[0], imagery.Image.create({ time: 4 })
  );
  const id2 = await imageStore.addImage(
    shapes[1], imagery.Image.create({ time: 5 })
  );

  expect(await imageStore.getCount()).toEqual(2);

  expect(await imageStore.getImage(id1)).toEqual(shapes[0]);
  expect(await imageStore.getImage(id2)).toEqual(shapes[1]);
  expect((await imageStore.getMetadata(id1)).time).toEqual(4);
  expect((await imageStore.getMetadata(id2)).time).toEqual(5);
});

test('clear existing removes existing images', async () => {
  const imageStore1 = new ImageStore(true);
  await imageStore1.setup();

  await imageStore1.addImage(shapes[2], imagery.Image.create({ time: 6 }));

  const imageStore2 = new ImageStore(true);
  await imageStore2.setup();

  expect(await imageStore2.getCount()).toEqual(0);
});

test('not using clear existing keeps existing images', async () => {
  const imageStore1 = new ImageStore(true);
  await imageStore1.setup();

  await imageStore1.addImage(shapes[2], imagery.Image.create({ time: 6 }));

  const imageStore2 = new ImageStore();
  await imageStore2.setup();

  expect(await imageStore2.getCount()).toEqual(1);
});

test('image store stores image add rates', async () => {
  const imageStore = new ImageStore(true);
  await imageStore.setup();

  const clock = lolex.install();

  expect(imageStore.getRate()).toEqual(0);

  await imageStore.addImage(shapes[0], imagery.Image.create({ time: 4 }));

  expect(imageStore.getRate()).toEqual(0.2);

  await imageStore.addImage(shapes[1], imagery.Image.create({ time: 5 }));

  expect(imageStore.getRate()).toEqual(0.4);

  clock.tick(5001);

  expect(imageStore.getRate()).toEqual(0);

  clock.uninstall();
});

test('image store deletes old images', async () => {
  const imageStore = new ImageStore(true, 2);
  await imageStore.setup();

  const ids = [];
  for (let i = 0; i < 3; i++) {
    ids[i] = await imageStore.addImage(
      shapes[i],
      imagery.Image.create({ time: i })
    );
  }
  const lastIds = [ids[ids.length - 2], ids[ids.length - 1]];

  expect(await imageStore.getCount()).toEqual(2);
  expect(await imageStore.getAvailable()).toEqual(lastIds);
  expect(await imageStore.exists(ids[0])).toEqual(true);
  expect(await imageStore.deleted(ids[0])).toEqual(true);
});

test('image store deletes any existing image', async () => {
  const imageStore = new ImageStore(true);
  await imageStore.setup();

  const ids = [];
  for (let i = 0; i < 3; i++) {
    ids[i] = await imageStore.addImage(
      shapes[i],
      imagery.Image.create({ time: i })
    );
  }
  await imageStore.deleteImage(ids[0]);
  const lastIds = [ids[ids.length - 2], ids[ids.length - 1]];

  expect(await imageStore.getCount()).toEqual(2);
  expect(await imageStore.getAvailable()).toEqual(lastIds);
  expect(await imageStore.exists(ids[0])).toEqual(true);
  expect(await imageStore.deleted(ids[0])).toEqual(true);
});

test('image store gets latest ID', async () => {
  const imageStore = new ImageStore(true);
  await imageStore.setup();

  await imageStore.addImage(
    shapes[0], imagery.Image.create({ time: 4 })
  );

  const latestId = await imageStore.addImage(
    shapes[1], imagery.Image.create({ time: 5 })
  );

  expect(await imageStore.getLatestId()).toEqual(latestId);
});
