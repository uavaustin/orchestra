import { createSocket } from 'dgram';
import { EventEmitter } from 'events';
import { promisify } from 'util';

import Mavlink from 'mavlink';

/** Encapsulates the node-mavlink library with a UDP socket. */
export default class MavlinkSocket extends EventEmitter {
  constructor(host, port) {
    super();

    this._host = host;
    this._port = port;

    this.setMaxListeners(0);
  }

  /** Load the XML messages and create the UDP socket. */
  async connect() {
    this._mav = await this._getMavlinkInstance();
    this._socket = await this._getSocket();
    this._registerMessageListener();
    this._registerSocketListener();
  }

  /** Close the socket. */
  async close() {
    await this._socket.closeAsync();
  }

  /** Send a Mavlink message with a type and fields. */
  async send(type, fields) {
    let message = await this._createMavMessage(type, fields);

    await this._socket.sendAsync(message.buffer, this._port, this._host);

    // Broadcast the send event.
    this.emit('send', type, fields);
  }

  async _getMavlinkInstance() {
    return await new Promise((resolve) => {
      let mav = new Mavlink(1, 1);
      mav.once('ready', () => resolve(mav));
    });
  }

  async _getSocket() {
    let socket = createSocket('udp4');

    // Adding promisified methods to the socket.
    socket.bindAsync = promisify(socket.bind.bind(socket));
    socket.sendAsync = promisify(socket.send.bind(socket));
    socket.closeAsync = promisify(socket.close.bind(socket));

    // Picking a port to bind that isn't the one given.
    let port = this._port !== 25565 ? 25565 : 25566;

    await socket.bindAsync(port);

    return socket;
  }

  async _createMavMessage(message, fields) {
    return await new Promise((resolve) => {
      this._mav.createMessage(message, fields, resolve);
    });
  }

  // Emit a receive event for each message, and an event specific to
  // each type.
  _registerMessageListener() {
    this._mav.on('message', (message) => {
      let type = this._mav.getMessageName(message.id);

      // Wait for specific message event to get the all the fields.
      this._mav.once(type, (_, fields) => {
        // Emit both events.
        this.emit('message', type, fields);
        let listened = this.emit(type, fields);

        // Emit another event if the message was not listened for.
        if (!listened) {
          this.emit('ignored', type, fields);
        }
      });
    });
  }

  // Pipe socket data into the mavlink instance.
  _registerSocketListener() {
    this._socket.on('message', (data) => {
      this._mav.parse(data);
    });
  }
}
