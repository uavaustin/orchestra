/** Socket.io client used throughout the web app. */

import io from 'socket.io-client';

const BASE = process.env.API_BASE;

const socket = io(BASE);

export default socket;
