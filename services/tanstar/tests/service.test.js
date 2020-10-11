import nock from 'nock';

import logger from '../src/common/logger';
import { interop } from '../src/messages';

import Service from '../src/service';

// Creating service
const service = new Service({
    port: 8765,
    serviceTimeout: 7000,
    interopProxyHost: 'interop-proxy',
    interopProxyPort: '8989'
});

beforeAll(async () => {
    await service.start();
});

test('successful retrieval of obstacle data', async () => {
    const exp = {
      time: 1, stationary: [{ pos: {lat: 2, lon: 3}, height: 4, radius: 5}]
    };
    const obstacle = interop.Obstacles.encode(exp).finish();

    const interopProxyApi = nock('http://interop-proxy:8989')
      .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
      .get('/api/obstacles')
      .reply(200, obstacle);

    const res = await service._retrieveObstacles();
    
    interopProxyApi.done(); // Check if API hit correctly
    expect(res).toMatchObject(exp); // Check if response is correct
});

afterAll(async () => {
  await service.stop();
});