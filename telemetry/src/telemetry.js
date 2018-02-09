import express from 'express';

import interop from './messages/interop_pb';
import telemetry from './messages/telemetry_pb';

let app = express();

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Yes, I\'m alive!\n');
});

let server = app.listen(5000);

console.log('Running server with Express at http://0.0.0.0:5000');

export { app, server };
