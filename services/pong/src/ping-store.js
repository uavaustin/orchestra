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
   */
  constructor(services) {
    this._ping = stats.PingTimes.create({
      time: time(),
      // Get the services in the correct format and sort by name.
      list: services.map(this._parseService.bind(this))
        .sort((a, b) => a.name > b.name),

      api_pings: services.map(this._parseService.bind(this))
        .sort((a, b) => a.name > b.name),

      device_pings: services.map(this._parseDevice.bind(this))
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

    const index = this._ping.list.findIndex(s => s.name === name);

    this._ping.list[index].online = online;
    this._ping.list[index].ms = ms;
  }

  updateDevicePing(name, online, ms) {
    this._ping.time = time();

    const index = this._ping.device_pings.findIndex(s => s.name === name);

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

  _parseDevice(device){
    return {
      name: device.name,
      host: device.name,
      online: false,
      ms: 0
    };
  }
}
