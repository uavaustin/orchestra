import express from 'express';

let app = express();

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Howdy.\n');
});

export default app;
