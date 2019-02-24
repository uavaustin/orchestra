import { stats } from './messages';

const time = () => Date.now() / 1000;

/** Stores ping rates. */
export default class PingStore {
  /**
   * Create a new PingStore.
   *
   * @param {Object[]} services
   * @param {string}   services[].name
   * @param {string}   services[].host
   * @param {number}   services[].port
   * @param {Object[]} devices
   * @param {string}   devices[].name
   * @param {string}   devices[].host
   */
  constructor(services, devices) {
    this._ping = stats.PingTimes.create({
      time: time(),
      // Get the services in the correct format and sort by name.
      list: services.map(this._parseService.bind(this))
        .sort((a, b) => a.name > b.name),

<<<<<<< HEAD
      api_pings: services.map(this._parseService.bind(this))
=======
      service_pings: services.map(this._parseService.bind(this))
>>>>>>> 38889d36b69f200c7824fbd134a63f0d06b74c39
        .sort((a, b) => a.name > b.name),

      device_pings: devices.map(this._parseDevice.bind(this))
        .sort((a, b) => a.name > b.name)
    });
  }

  /**
   * Feed new service ping to the store.
   *
   * @param {string}  name
   * @param {boolean} online
   * @param {number}  ms
   */
  updateServicePing(name, online, ms) {
    this._ping.time = time();

<<<<<<< HEAD
    const index = this._ping.api_pings.findIndex(s => s.name === name);

    this._ping.api_pings[index].online = online;
    this._ping.api_pings[index].ms = ms;
  }

  updateDevicePing(name, online, ms) {
    this._ping.time = time();

    const index = this._ping.device_pings.findIndex(s => s.name === name);

=======
    const index = this._ping.service_pings.findIndex(s => s.name === name);

    this._ping.list[index].online = online;
    this._ping.list[index].ms = ms;
    this._ping.service_pings[index].online = online;
    this._ping.service_pings[index].ms = ms;
  }

  updateDevicePing(name, online, ms) {
    this._ping.time = time();

    const index = this._ping.device_pings.findIndex(s => s.name === name);

>>>>>>> 38889d36b69f200c7824fbd134a63f0d06b74c39
    this._ping.device_pings[index].online = online;
    this._ping.device_pings[index].ms = ms;
  }

  /**
   * Get the current pings.
   *
   * @returns {stats.PingTimes}
   */
  getPing() {
    return this._ping;
  }

  // Convert a service object into one for a PingTimes::ServicePing
  // message.
  _parseService(service) {
    return {
      name: service.name,
      host: service.host,
      port: service.port.toString(),
      online: false,
      ms: 0
    };
  }

<<<<<<< HEAD
  _parseDevice(device){
=======
  _parseDevice(device) {
>>>>>>> 38889d36b69f200c7824fbd134a63f0d06b74c39
    return {
      name: device.name,
      host: device.host,
      online: false,
      ms: 0
    };
  }
}
