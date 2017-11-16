import 'colors';

import AUVSIClient from 'auvsisuas-client';
import { InteropTelem } from './messages/telemetry_pb.js'

let url = process.env.INTEROP_URL;
let username = process.env.USERNAME;
let password = process.env.PASSWORD;

let client = new AUVSIClient();

client.login('http://' + url, username, password, 5000)
    .then(() => {
        console.log('Login Sucessful.'.green);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
