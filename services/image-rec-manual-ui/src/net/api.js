/** Utilities for querying the API. */

import request from 'superagent';
import addProtobuf from 'superagent-protobuf';

addProtobuf(request);

const BASE = process.env.API_BASE + 'api';

export async function getAlive() {
  return (await request.get(BASE + '/alive')).text;
}

