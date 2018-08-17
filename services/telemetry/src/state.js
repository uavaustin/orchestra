import { interop, telemetry } from './messages';

export default class PlaneState {
    constructor() {
        this.lat = null;
        this.lon = null;
        this.altMSL = null;
        this.altAGL = null;
        this.vx = null;
        this.vy = null;
        this.vz = null;
        this.roll = null;
        this.pitch = null;
        this.yaw = null;
        this.airspeed = null;
        this.groundSpeed = null;
        this.battery = {
            temp: null,
            voltages: null,
            current: null,
            currentSpent: null,
            percentage: null,
            approxTime: null
        };
        this.mode = null;
    }

    getPositionProto() {
        return telemetry.Position.create({
            lat: this.lat,
            lon: this.lon
        });
    }

    getAerialPositionProto() {
        return interop.AerialPosition.create({
            lat: this.lat,
            lon: this.lon,
            alt_msl: this.altMSL
        })
    }

    getRotationProto() {
        return telemetry.Rotation.create({
            yaw: this.yaw,
            pitch: this.pitch,
            roll: this.roll
        });
    }

    getAltitudeProto() {
        return telemetry.Altitude.create({
            msl: this.altMSL,
            agl: this.altAGL
        });
    }

    getVelocityProto() {
        return telemetry.Velocity.create({
            x: this.vx,
            y: this.vy,
            z: this.vz
        });
    }

    getSpeedProto() {
        return telemetry.Speed.create({
            airspeed: this.airspeed,
            ground_speed: this.groundSpeed
        });
    }

    getInteropTelemProto() {
        return interop.InteropTelem.create({
            time: Date.now() / 1000,
            pos: this.getAerialPositionProto(),
            yaw: this.yaw
        });
    }

    getCameraTelemProto() {
        return telemetry.CameraTelem.create({
            time: Date.now() / 1000,
            lat: this.lat,
            lon: this.lon,
            alt: this.altAGL,
            yaw: this.yaw,
            pitch: this.pitch,
            roll: this.roll
        });
    }

    getBatteryProto() {
        const battery = this.battery;
        return telemetry.Battery.create({
            temperature: battery.temp,
            voltages: battery.voltages,
            current: battery.current,
            current_spent: battery.currentSpent,
            percentage: battery.percentage,
            approx_time: battery.approxTime
        });
    }
}
